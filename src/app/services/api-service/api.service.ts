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
  isEmptyResults: boolean = false; // used to hide loading spinner when no results are found
  isInvalidKey: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false); // used to check if the API key is invalid

  // using the xml2js parser to convert the XML response to JSON
  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/xml',
    'DB-Client-Id': `${this.API_ID}`,
    'DB-Api-Key': `${this.API_KEY}`
  });

  constructor(private http: HttpClient, private dataVerifier: DataVerifierService) {
    this.dataVerifier.updateCache();
  }

  /**
   * Fetches timetables for a given station, date, and hour and saves the data in a global variable.
   *
   * @param station_name - The name of the train station.
   * @param date - The date in the format YYMMDD (example: 241120).
   * @param hour - The hour in the format HH (example: 21).
   * @param end_station_name - The name of the destination station.
   * @param show_arrival - A boolean value that determines whether to show arrival times.
   */
  getTimetableData(station_name: string, date?: string, hour?: string, end_station_name?: string,
                   show_arrival?: boolean): void {
    this.fetchStation(station_name).subscribe({
      next: (data: Stations | string): void => {
        if (data === null || typeof data === 'string') {
          this.dataVerifier.station_stops = undefined;
          return this.dataVerifier.toggleErrorAlert('invalid_station_start');  // start_station doesn't exist
        }

        this.dataVerifier.current_station = data.station;
        localStorage.setItem('current_station', JSON.stringify(this.dataVerifier.current_station));
        this.dataVerifier.updateStationList(data.station.name);

        // set default values for date and hour if they are not provided
        date = date || new Date().toISOString().slice(2, 10).replace(/-/g, '');
        hour = hour || new Date().getHours().toString().padStart(2, '0');
        this.fetchPlannedData(this.dataVerifier.current_station, date, hour.split(':')[0]).subscribe({
          next: (data: Timetable): void => {
            if (end_station_name) { // check if end station exist
              this.fetchStation(end_station_name).subscribe({
                next: (data_end: Stations | string): void => {
                  if (data_end === null || typeof data_end === 'string') {
                    this.dataVerifier.station_stops = undefined;
                    return this.dataVerifier.toggleErrorAlert('invalid_station_end');  // end_station doesn't exist
                  }

                  this.dataVerifier.updateStationList(data_end.station.name);
                  this.dataVerifier.toggleErrorAlert(); // remove error alert if it exists
                  this.dataVerifier.station_stops = { ...data, s: this.dataVerifier.filterDirectRoutes(data, end_station_name, show_arrival) };
                }, error: (error): void => {
                  console.error(error);
                }
              });

            } else {
              this.dataVerifier.station_stops = data;  // Save all fetched timetable data if no destination station is specified
            }
          }, error: (error): void => {
            console.error(error);
          }
        });

      }, error: (error): void => {
        if (error.status == 404) {
          this.dataVerifier.toggleErrorAlert('invalid_station_start');  // start_station doesn't exist
        } else if (error.status == 401) { this.isInvalidKey.next(true); }
        console.error(error);
      }
    });
  }

  /**
   * Fetches data from stations with an optional limit and federal state filter.
   *
   * @param limit - The maximum number of stations to fetch. Defaults to 10 if not provided.
   * @param federalstate - The federal state to filter the stations by. Defaults to 'sachsen-anhalt' if not provided.
   */
  getDataFromStations(limit?: number, federalstate?: string): void {
    this.fetchStations(limit || 12, federalstate || 'sachsen-anhalt').subscribe({
      next: (data: StationDataResponse): void => {
        this.dataVerifier.stations = data.result;
        localStorage.setItem('stations', JSON.stringify(this.dataVerifier.stations));
        this.dataVerifier.updateStationList(data.result);
      }, error: (error): void => {
        if (error.status == 401) { this.isInvalidKey.next(true); }  // invalid api key provided
        console.error(error);
      }
    });
  }

  /**
   * Fetches data for a specific station by its name.
   *
   * @param station_name - The name of the station to fetch data for.
   */
  getDataByStation(station_name: string): void {
    this.fetchStations(5, null, station_name).subscribe({
      next: (data: StationDataResponse): void => {
        this.dataVerifier.stations = data.result;
        localStorage.setItem('stations', JSON.stringify(this.dataVerifier.stations));
        this.dataVerifier.updateStationList(data.result);
      }, error: (error): void => {
        // station not found
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
   * Checks the stations for elevator facilities.
   * Sets the `isLoading` flag to true while the data is being fetched.
   * On successful data retrieval, updates the `elevators` array and stores the data in localStorage.
   * If an error occurs during the data fetch, logs the error to the console.
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


  //                                HTTP REQUESTS


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
