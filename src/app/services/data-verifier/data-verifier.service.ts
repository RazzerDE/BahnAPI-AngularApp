import { Injectable } from '@angular/core';
import {Schedule, Timetable} from "../api-service/types/timetables";
import {Parser} from "xml2js";
import {Station} from "../api-service/types/stations";
import {StationData} from "../api-service/types/station-data";
import {Elevator} from "../api-service/types/elevators";

@Injectable({
  providedIn: 'root'
})
export class DataVerifierService {
  current_station: Station | undefined;
  station_stops: Timetable | undefined;
  stations: StationData[] = [];
  elevators: Elevator[] = [];

  private parser: Parser = new Parser({explicitArray: false, trim: true, explicitRoot: false, mergeAttrs: true});

  /**
   * Converts an XML string to a JSON object - is used to parse the XML response from the API.
   *
   * @param xml - The XML string to be converted.
   * @returns A promise that resolves to the JSON representation of the XML string.
   */
  xmlToJson(xml: string): Promise<any> {
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
  updateCache(): void {
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

  /**
   * Filters the timetable data to find direct routes to the specified destination station.
   *
   * @param timetable - The fetched timetable data.
   * @param destinationStation - The name of the destination train station.
   * @returns An array of schedules that have direct routes to the destination station.
   */
  filterDirectRoutes(timetable: Timetable, destinationStation: string): Schedule[] {
    const normalizedDestination = this.normalizeStationName(destinationStation);
    // Normalize the name of the stations because of different naming conventions of the BahnAPI
    return timetable.s.filter((schedule: Schedule) => {
      if (schedule.dp && schedule.dp.ppth) {
        const plannedPath = schedule.dp.ppth.split('|');
        return plannedPath.some(station => this.normalizeStationName(station) === normalizedDestination);
      }
      return false;
    });
  }

  /**
   * Normalizes a station name by converting it to lowercase and removing spaces and hyphens.
   *
   * @param stationName - The name of the station to normalize.
   * @returns The normalized station name.
   */
  normalizeStationName(stationName: string): string {
    return stationName.toLowerCase().replace(/[\s-]/g, '');
  }
}
