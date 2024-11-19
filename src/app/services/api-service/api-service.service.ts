import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "./types/environment";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private API_URL: string = environment.API_URL;
  private API_KEY: string = environment.API_KEY;
  private API_ID: string = environment.API_ID;

  private ENDPOINT_TIMETABLES = "timetables/v1/";
  private ENDPOINT_STATIONS = "station-data/v2/";
  private ENDPOINT_FASTA = "fasta/v2/";

  headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/xml',
    'DB-Client-Id': `${this.API_ID}`,
    'DB-Api-Key': `${this.API_KEY}`
  });

  constructor(private http: HttpClient) {
    // this.fetchPlannedData().subscribe({
    //   next: data => console.log(data),
    //   error: error => console.error(error)
    // });
  }


  fetchPlannedData(): Observable<any> {
    return this.http.get(`${this.API_URL}/${this.ENDPOINT_TIMETABLES}`, {headers: this.headers});
  }


}
