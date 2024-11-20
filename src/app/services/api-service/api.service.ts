import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {from, map, mergeMap, Observable} from "rxjs";
import {environment} from "./types/environment";
import {Station, Stations} from "./types/stations";
import {Parser} from "xml2js";
import {Schedule, Timetable} from "./types/timetables";

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

  // using the xml2js parser to convert the XML response to JSON
  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/xml',
    'DB-Client-Id': `${this.API_ID}`,
    'DB-Api-Key': `${this.API_KEY}`
  });
  private parser: Parser = new Parser({explicitArray: false, trim: true, explicitRoot: false, mergeAttrs: true});

  constructor(private http: HttpClient) {}

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


  //                                GET DATA FUNCTIONS


  /**
   * Fetches timetables for a given station, date, and hour.
   *
   * @param station_name - The name of the train station.
   * @param date - The date in the format YYMMDD (example: 241120).
   * @param hour - The hour in the format HH (example: 21).
   */
  fetchTimetables(station_name: string, date?: string, hour?: string): void {
    this.fetchStation(station_name).subscribe({
      next: (data: Stations): void => {
        this.current_station = data.station;

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


  //                                HTTP REQUESTS


  // fetchStations(): Observable<any> {
  //   return this.http.get(`${(this.API_URL + this.ENDPOINT_TIMETABLES + `stations`,
  //     {responseType: 'text', headers: this.headers})
  //     .pipe(mergeMap(xmlResponse => from(this.xmlToJson(xmlResponse))),
  //       map(response => response.__zone_symbol__value || response)
  //     );
  // }

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
