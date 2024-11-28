import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {BehaviorSubject, from, map, mergeMap, Observable} from "rxjs";
import {environment} from "./types/environment";
import {Station, Stations} from "./types/stations";
import {Timetable} from "./types/timetables";
import {StationDataResponse} from "./types/station-data";
import {Elevator} from "./types/elevators";
import {DataVerifierService} from "../data-verifier/data-verifier.service";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private API_URL: string = environment.API_URL;
  private API_KEY: string = environment.API_KEY;
  private API_ID: string = environment.API_ID;

  private ENDPOINT_TIMETABLES: string = "timetables/v1/";
  private ENDPOINT_STATIONS: string = "station-data/v2/";
  private ENDPOINT_FASTA: string = "fasta/v2/";

  isLoading: boolean = false;
  isEmptyResults: boolean = false; // wird verwendet um das Loading-Gif zu verstecken, wenn keine Ergebnisse gefunden wurden
  isInvalidKey: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false); // wird genutzt um zu checken ob der API-Key gültig ist

  // Verwendung des xml2js-Parsers, um die XML-Antwort in JSON zu konvertieren
  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/xml',
    'DB-Client-Id': `${this.API_ID}`,
    'DB-Api-Key': `${this.API_KEY}`
  });

  constructor(private http: HttpClient, private dataVerifier: DataVerifierService) {
    this.dataVerifier.updateCache();
  }

  /**
   * Ruft Fahrpläne für eine bestimmte Station, ein Datum und eine Stunde ab und speichert die Daten in einer globalen Variable.
   *
   * @param station_name - Der Name des Bahnhofs.
   * @param date - Das Datum im Format YYMMDD (Beispiel: 241120).
   * @param hour - Die Stunde im Format HH (Beispiel: 21).
   * @param end_station_name - Der Name des Zielbahnhofs.
   * @param show_arrival - Ein boolescher Wert, der bestimmt, ob Ankunftszeiten angezeigt werden sollen.
   */
  getTimetableData(station_name: string, date?: string, hour?: string, end_station_name?: string,
                   show_arrival?: boolean): void {
    this.fetchStation(station_name).subscribe({
      next: (data: Stations | string): void => {
        if (data === null || typeof data === 'string') {
          this.dataVerifier.station_stops = undefined;
          return this.dataVerifier.toggleErrorAlert('invalid_station_start');  // start_station existiert nicht
        }

        this.dataVerifier.current_station = data.station;
        localStorage.setItem('current_station', JSON.stringify(this.dataVerifier.current_station));
        this.dataVerifier.updateStationList(data.station.name);

        // Standardwerte für Datum und Stunde festlegen, falls sie nicht angegeben wurden
        date = date || new Date().toISOString().slice(2, 10).replace(/-/g, '');
        hour = hour || new Date().getHours().toString().padStart(2, '0');
        this.fetchPlannedData(this.dataVerifier.current_station, date, hour.split(':')[0]).subscribe({
          next: (data: Timetable): void => {
            if (end_station_name) { // überprüfen, ob end_station existiert
              this.fetchStation(end_station_name).subscribe({
                next: (data_end: Stations | string): void => {
                  if (data_end === null || typeof data_end === 'string') {
                    this.dataVerifier.station_stops = undefined;
                    return this.dataVerifier.toggleErrorAlert('invalid_station_end');  // existiert nicht
                  }

                  this.dataVerifier.updateStationList(data_end.station.name);
                  this.dataVerifier.toggleErrorAlert(); // Fehlermeldung ausblenden, wenn eine existiert
                  this.dataVerifier.station_stops = { ...data, s: this.dataVerifier.filterDirectRoutes(data, end_station_name, show_arrival) };
                }, error: (error): void => {
                  console.error(error);
                }
              });

            } else {
              this.dataVerifier.station_stops = data;  // // wird verwendet um das Loading-Gif zu verstecken, wenn keine Ergebnisse gefunden wurden
            }
          }, error: (error): void => {
            console.error(error);
          }
        });

      }, error: (error): void => {
        if (error.status == 404) {
          this.dataVerifier.toggleErrorAlert('invalid_station_start');  // start_station existiert nicht
        } else if (error.status == 401) { this.isInvalidKey.next(true); }
        console.error(error);
      }
    });
  }

  /**
   * Ruft Daten von Stationen mit einem optionalen Limit und einem Filter für das Bundesland ab.
   *
   * @param limit - Die maximale Anzahl der abzurufenden Stationen. Standardmäßig 10, wenn nicht angegeben.
   * @param federalstate - Das Bundesland, nach dem die Stationen gefiltert werden sollen. Standardmäßig 'sachsen-anhalt', wenn nicht angegeben.
   */
  getDataFromStations(limit?: number, federalstate?: string): void {
    this.fetchStations(limit || 12, federalstate || 'sachsen-anhalt').subscribe({
      next: (data: StationDataResponse): void => {
        this.dataVerifier.stations = data.result;
        localStorage.setItem('stations', JSON.stringify(this.dataVerifier.stations));
        this.dataVerifier.updateStationList(data.result);
      }, error: (error): void => {
        if (error.status == 401) { this.isInvalidKey.next(true); }  // API-Key ist ungültig
        console.error(error);
      }
    });
  }

  /**
   * Ruft Daten für eine bestimmte Station anhand ihres Namens ab.
   *
   * @param station_name - Der Name der Station, für die Daten abgerufen werden sollen.
   */
  getDataByStation(station_name: string): void {
    this.fetchStations(5, null, station_name).subscribe({
      next: (data: StationDataResponse): void => {
        this.dataVerifier.stations = data.result;
        localStorage.setItem('stations', JSON.stringify(this.dataVerifier.stations));
        this.dataVerifier.updateStationList(data.result);
      }, error: (error): void => {
        // station existiert nicht
        if (error.status == 404) {
          const error_box: HTMLSpanElement = document.getElementById('error_trainstation') as HTMLSpanElement;
          if (error_box && error_box.classList.contains('hidden')) {
            error_box.classList.remove('hidden');
          }

          this.dataVerifier.stations = [];
          localStorage.setItem('stations', JSON.stringify(this.dataVerifier.stations));
          return;
        } else if (error.status == 401) { this.isInvalidKey.next(true); }

        console.error(error);
      }
    });
  }

  /**
   * Überprüft die Stationen auf Aufzugsanlagen.
   * Setzt die `isLoading`-Flagge auf true, während die Daten abgerufen werden.
   * Bei erfolgreichem Abruf der Daten wird das `elevators`-Array aktualisiert und die Daten im localStorage gespeichert.
   * Wenn ein Fehler beim Abrufen der Daten auftritt, wird der Fehler in der Konsole protokolliert.
   */
  checkStationsForElevator(): void {
    this.fetchFacilities().subscribe({
      next: (data: Elevator[]): void => {
        this.dataVerifier.elevators = data;
        localStorage.setItem('elevators', JSON.stringify(this.dataVerifier.elevators));
      },
      error: (error): void => {
        console.error(error);
      }
    });
  }


  //                                HTTP ABFRAGEN


  fetchStations(limit: number, federalstate: string | null, searched_string?: string): Observable<any> {
    let params = new HttpParams().set('limit', limit.toString());
    if (federalstate != null) { params = params.set('federalstate', federalstate); }
    if (searched_string) { params = params.set('searchstring', searched_string); }

    return this.http.get(this.API_URL + this.ENDPOINT_STATIONS + 'stations',
      {responseType: 'json', headers: this.headers, params: params});
  }

  fetchFacilities(): Observable<any> {
    let params = new HttpParams().set('type', 'ELEVATOR');
    params = params.set('state', 'ACTIVE');

    return this.http.get(`${(this.API_URL + this.ENDPOINT_FASTA + `facilities`)}`,
      {responseType: 'json', headers: this.headers, params: params});
  }

  fetchStation(station_name: string): Observable<any> {
    return this.http.get(`${(this.API_URL + this.ENDPOINT_TIMETABLES + `station/${station_name}`)}`,
      {responseType: 'text', headers: this.headers})
      .pipe(mergeMap(xmlResponse => from(this.dataVerifier.xmlToJson(xmlResponse))),
        map(response => response.__zone_symbol__value || response)
    );
  }

  fetchPlannedData(station: Station, date: string, hour: string): Observable<any> {
    return this.http.get(`${(this.API_URL + this.ENDPOINT_TIMETABLES + `plan/${station.eva}/${date}/${hour}`)}`,
      {responseType: 'text', headers: this.headers})
      .pipe(mergeMap(xmlResponse => from(this.dataVerifier.xmlToJson(xmlResponse))),
        map(response => response.__zone_symbol__value || response)
    );
  }

}
