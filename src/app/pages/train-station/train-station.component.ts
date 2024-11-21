import { Component } from '@angular/core';
import {TableComponent} from "../../util/table/table.component";
import {ApiService} from "../../services/api-service/api.service";
import {StationData} from "../../services/api-service/types/station-data";

@Component({
  selector: 'app-train-station',
  standalone: true,
  imports: [
    TableComponent
  ],
  templateUrl: './train-station.component.html',
  styleUrl: './train-station.component.css'
})
export class TrainStationComponent {
  public currentTrainStation: string = "";
  public tableHeaders: string[] = ['Station', 'WLAN', 'Parkplatz', 'barrierefrei', 'Fahrstuhl', 'Adresse']
  public tableData: string[][] = [];

  private isTableRefreshActive: boolean = false;

  constructor(protected apiService: ApiService) {
    if (this.apiService.stations.length === 0) {
      console.log("empty; api call");
      this.apiService.getDataFromStations();
    }

    if (this.apiService.elevators.length === 0) {
      console.log("empty");
      this.apiService.checkStationsForElevator();
    }

    this.generateStationsTable();
  }

  /**
   * Changes the current train station based on the value entered in the search input field.
   * If the input is empty or starts with a space, the function will not update the current train station.
   */
  changeTrainStation(): void {
    const searchInput = document.getElementById('searchStation') as HTMLInputElement;
    const error_box: HTMLSpanElement = document.getElementById('error_trainstation') as HTMLSpanElement;
    if (error_box && !error_box.classList.contains('hidden')) {
      error_box.classList.add('hidden');
    }

    if (searchInput.value === '' || searchInput.value.startsWith(' ')) {
      this.apiService.getDataFromStations();
    } else {
      this.apiService.getDataByStation(searchInput.value);
    }

    // update listed trainstation
    this.currentTrainStation = 'Lädt..';
    setTimeout(() => {this.mapStationsToTableData(); }, 1000);
  }

  /**
   * Generates the table data for the stations.
   * If the stations data is not yet available, it waits for 2 seconds and then attempts to generate the table data.
   */
  generateStationsTable(): void {
    if (this.apiService.stations.length === 0) { // make API call to get station data
      setTimeout(() => {this.mapStationsToTableData(); }, 2000);
    } else { // already cached
      this.mapStationsToTableData();
    }

    // update the table every 5s
    if (!this.isTableRefreshActive) {
      setInterval(() => { this.mapStationsToTableData(); }, 5000);
    }
  }

  /**
   * Maps the stations data to the table data format.
   * Each station is represented as an array of strings containing its name, availability of WiFi, parking, stepless access, elevator, and address.
   * The table data is then sorted alphabetically by station name.
   */
  private mapStationsToTableData(): void {
    if (this.apiService.stations.length === 1) {
      this.currentTrainStation = this.apiService.stations[0].name;
    } else {
      this.currentTrainStation = "";
    }

    this.tableData = this.apiService.stations.map((station: StationData) => [
      station.name,
      station.hasWiFi ? '✔' : '❌',
      station.hasParking ? '✔' : '❌',
      station.hasSteplessAccess ? '✔' : '❌',
      this.apiService.elevators.some(elevator => elevator.stationnumber === station.number) ? '✔' : '❌',
      station.mailingAddress.street + ', ' + station.mailingAddress.city
    ]).sort((a, b) => a[0].localeCompare(b[0]));


  }
}
