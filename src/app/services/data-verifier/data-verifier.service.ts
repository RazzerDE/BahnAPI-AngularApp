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
  // used for the autocompletion feature at input fields
  station_names: string[] = [];
  filtered_station_names: string[] = [];
  completion_name: string = '';
  completion_name_end: string = '';

  // used to store the current station and the station stops
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
    const temp_station_names: string | null = localStorage.getItem('station_names');
    if (temp_stations && temp_stations.length > 0) {
      this.stations = JSON.parse(<string>localStorage.getItem('stations'));
    }

    if (temp_elevators && temp_elevators.length > 0) {
      this.elevators = JSON.parse(<string>localStorage.getItem('elevators'));
    }

    if (temp_station_names && temp_station_names.length > 0) {
      this.station_names = JSON.parse(<string>localStorage.getItem('station_names'));
    }

    if (temp_current_station) {
      if (this.current_station === undefined) { localStorage.removeItem('current_station'); return; }
      this.current_station = JSON.parse(<string>localStorage.getItem('current_station'));
    }
  }

  /**
   * Filters the timetable data to find direct routes to the specified destination station.
   *
   * @param timetable - The fetched timetable data.
   * @param destinationStation - The name of the destination train station.
   * @param show_arrival - A boolean value that determines whether to show arrival times.
   * @returns An array of schedules that have direct routes to the destination station.
   */
  filterDirectRoutes(timetable: Timetable, destinationStation: string, show_arrival?: boolean): Schedule[] {
    const normalizedDestination: string = this.normalizeStationName(destinationStation);
    // Normalize the name of the stations because of different naming conventions of the BahnAPI
    return timetable.s.filter((schedule: Schedule) => {
      const path: string | undefined = show_arrival ? schedule.ar?.ppth : schedule.dp?.ppth;
      if (path) {
        const plannedPath: string[] = path.split('|');
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


  /**
   * Toggles the visibility of the error alert box based on the provided error type.
   *
   * @param error_type - The type of error to display. Can be one of the following:
   *   - 'invalid_station_end': The end station is invalid.
   *   - 'invalid_station_start': The start station is invalid.
   *   - 'same_station': The start and end stations are the same.
   *   - 'no_stations': No direct routes found for the specified stations.
   *   If no error type is provided, the alert box will be hidden.
   */
  toggleErrorAlert(error_type?: 'invalid_station_end' | 'invalid_station_start' | 'same_station' | 'no_stations'): void {
    const alert_box: HTMLDivElement = document.getElementById('invalidAlert') as HTMLDivElement;
    const alert_title: HTMLHeadingElement = document.getElementById('alert_title') as HTMLHeadingElement;
    const alert_info: HTMLSpanElement = document.getElementById('alert_info') as HTMLSpanElement;
    if (!alert_box || !alert_title || !alert_info) { return; }

    if (!error_type) { // Hide the alert box
      alert_box.classList.add('hidden');
      return;
    }

    // check if an error is already shown
    if (!alert_box.classList.contains('hidden')) { return; }

    if (error_type === 'same_station') {
      alert_title.innerText = 'Invalid Stations';
      alert_info.innerText = 'The start station cannot be the same as the destination station.';
    } else if (error_type === 'no_stations') {
      alert_title.innerText = 'No Trains Found';
      alert_info.innerText = 'No trains were found for the specified direct connection.';
    } else if (error_type.startsWith('invalid_station')) {
      const stationType: string = error_type === 'invalid_station_start' ? 'Start' : 'End';
      alert_title.innerText = `Invalid ${stationType} Station`;
      alert_info.innerText = `The specified ${stationType} station was not found in the API.
                          Pay attention to hyphens, capitalization, and spaces!`;
    }

    if (alert_box.classList.contains('hidden')) { // Show the alert box
      alert_box.classList.remove('hidden');
    }
  }

  /**
   * Formats the given time string to "HH:MM" format.
   * @param pt - The time string in the format "YYYYMMDDHHMM".
   * @returns The formatted time string.
   */
  formatTime(pt: string): string {
    return `${pt.slice(6, 8)}:${pt.slice(8, 10)}`;
  }

  /**
   * Toggles the visibility of the auto-completion menu.
   * If the menu is currently hidden, it will be shown if there are cached station names.
   * If the menu is currently visible, it will be hidden.
   */
  toggleAutoCompletionMenu(input: HTMLInputElement): void {
    const autoCompletionMenu: HTMLDivElement = document.getElementById('autoCompletionMenu') as HTMLDivElement;
    if (!autoCompletionMenu) { return; }

    if (this.station_names.length > 0 && input.value.length > 0 && !this.station_names.includes(input.value)) {
      // find only entries that start with the input value
      this.filtered_station_names = this.station_names.filter((station: string): boolean => station.toLowerCase().startsWith(input.value.toLowerCase()));
      if (autoCompletionMenu.classList.contains('hidden') && this.filtered_station_names.length > 0) {
        autoCompletionMenu.classList.remove('hidden');
      }
    }

    if (this.station_names.length === 0 || input.value.length === 0 || this.filtered_station_names.length === 0 || this.station_names.includes(input.value)) {
      if (!autoCompletionMenu.classList.contains('hidden')) {
        autoCompletionMenu.classList.add('hidden');
      }
    }
  }

  /**
   * Updates the list of station names.
   * If a single station name is provided, it adds it to the list if it doesn't already exist.
   * If an array of station data is provided, it replaces the current list with the names from the array.
   *
   * @param station - A single station name or an array of station data.
   */
  updateStationList(station: string | StationData[]): void {
    if (typeof station === 'string') {
      if (!this.station_names.includes(station)) {
        this.station_names.push(station);
      }
    }

    // update cache
    localStorage.setItem('station_names', JSON.stringify(this.station_names));
  }

}
