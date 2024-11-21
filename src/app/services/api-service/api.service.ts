import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {from, map, mergeMap, Observable} from "rxjs";
import {environment} from "./types/environment";
import {Station, Stations} from "./types/stations";
import {Parser} from "xml2js";
import {Schedule, Timetable} from "./types/timetables";
import {StationData, StationDataResponse} from "./types/station-data";
import {Elevator} from "./types/elevators";

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

  current_station: Station | undefined;
  station_stops: Schedule[] = [];
  stations: StationData[] = [];
  elevators: Elevator[] = [];

  // using the xml2js parser to convert the XML response to JSON
  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/xml',
    'DB-Client-Id': `${this.API_ID}`,
    'DB-Api-Key': `${this.API_KEY}`
  });
  private parser: Parser = new Parser({explicitArray: false, trim: true, explicitRoot: false, mergeAttrs: true});

  constructor(private http: HttpClient) {
    this.updateCache();
  }

  /**
   * Converts an XML string to a JSON object - is used to parse the XML response from the API.
   *
   * @param xml - The XML string to be converted.
   * @returns A promise that resolves to the JSON representation of the XML string.
   */
  private xmlToJson(xml: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.parser.parseString(xml, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Updates the cache by retrieving stored data from localStorage.
   * If data is found, it updates the corresponding properties in the service.
   */
  private updateCache(): void {
    const temp_stations: string | null = localStorage.getItem('stations');
    const temp_elevators: string | null = localStorage.getItem('elevators');
    const temp_current_station: string | null = localStorage.getItem('current_station');
    if (temp_stations && temp_stations.length > 0) {
      this.stations = JSON.parse(localStorage.getItem('stations') || '');
    }

    if (temp_elevators && temp_elevators.length > 0) {
      this.elevators = JSON.parse(localStorage.getItem('elevators') || '');
    }

    if (temp_current_station) {
      this.current_station = JSON.parse(localStorage.getItem('current_station') || '');
    }
  }


  //                                GET DATA FUNCTIONS


  /**
   * Fetches timetables for a given station, date, and hour and saves the data in a global variable.
   *
   * @param station_name - The name of the train station.
   * @param date - The date in the format YYMMDD (example: 241120).
   * @param hour - The hour in the format HH (example: 21).
   */
  getTimetableData(station_name: string, date?: string, hour?: string): void {
    this.fetchStation(station_name).subscribe({
      next: (data: Stations): void => {
        this.current_station = data.station;
        localStorage.setItem('current_station', JSON.stringify(this.current_station));

        // set default values for date and hour if they are not provided
        date = date || new Date().toISOString().slice(2, 10).replace(/-/g, '');
        hour = hour || new Date().getHours().toString().padStart(2, '0');
        this.fetchPlannedData(this.current_station, date, hour).subscribe({
          next: (data: Timetable): void => {
            this.station_stops = data.s;
          }, error: (error): void => {
            console.error(error);
          }
        });

      }, error: (error): void => {
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
        this.stations = data.result;
        localStorage.setItem('stations', JSON.stringify(this.stations));
      }, error: (error): void => {
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
        this.stations = data.result;
      }, error: (error): void => {
        console.error(error);
      }
    });
  }

  checkStationsForElevator(): void {
    this.fetchFacilities().subscribe({
      next: (data: Elevator[]): void => {
        this.elevators = data;
        localStorage.setItem('elevators', JSON.stringify(this.elevators));
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
      .pipe(mergeMap(xmlResponse => from(this.xmlToJson(xmlResponse))),
        map(response => response.__zone_symbol__value || response)
    );
  }

  fetchPlannedData(station: Station, date: string, hour: string): Observable<any> {
    return this.http.get(`${(this.API_URL + this.ENDPOINT_TIMETABLES + `plan/${station.eva}/${date}/${hour}`)}`,
      {responseType: 'text', headers: this.headers})
      .pipe(mergeMap(xmlResponse => from(this.xmlToJson(xmlResponse))),
        map(response => response.__zone_symbol__value || response)
    );
  }

}
