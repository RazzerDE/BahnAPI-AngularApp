import { Injectable } from '@angular/core';
import {environment} from "./types/environment";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {
  private API_URL: string | undefined = environment.API_URL;
  private API_KEY: string | undefined = environment.API_KEY;



  constructor(private http: HttpClient) {}


}
