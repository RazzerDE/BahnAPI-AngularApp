import {Component, OnInit} from '@angular/core';
import {TableComponent} from "../../util/table/table.component";
import {ApiService} from "../../services/api-service/api.service";
import {StationData} from "../../services/api-service/types/station-data";
import {NavigationEnd, Router} from "@angular/router";
import {DataVerifierService} from "../../services/data-verifier/data-verifier.service";

@Component({
  selector: 'app-train-station',
  standalone: true,
  imports: [
    TableComponent
  ],
  templateUrl: './train-station.component.html',
  styleUrl: './train-station.component.css'
})
export class TrainStationComponent implements OnInit{
  public currentTrainStation: string = "";
  public tableHeaders: string[] = ['Station', 'WLAN', 'Parkplatz', 'barrierefrei', 'Fahrstuhl', 'Adresse']
  public tableData: string[][] = [];

  private isTableRefreshActive: boolean = false;

  constructor(protected apiService: ApiService, private router: Router, private dataVerifier: DataVerifierService) {
    this.apiService.isLoading = true;

    if (this.dataVerifier.stations.length === 0) {
      this.apiService.getDataFromStations();
    }

    if (this.dataVerifier.elevators.length === 0) {
      this.apiService.checkStationsForElevator();
    }

    this.generateStationsTable();
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log('Page visited by redirect:', event.urlAfterRedirects);
        // set loading to true after angular router navigation
        this.apiService.isLoading = true;
      }
    });
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
    } else { // check if station is already cached
      const searchValue = searchInput.value.toLowerCase();
      const cachedStation = this.dataVerifier.stations.find(station => station.name.toLowerCase() === searchValue);

      if (cachedStation) {
        this.dataVerifier.stations = [cachedStation];
        this.mapStationsToTableData();
      } else {
        this.apiService.getDataByStation(searchValue);
      }
    }

    // update listed trainstation
    this.currentTrainStation = 'Lädt..';
    this.apiService.isLoading = true;
    setTimeout(() => {this.mapStationsToTableData(); }, 1000);
  }

  /**
   * Generates the table data for the stations.
   */
  generateStationsTable(): void {
    if (this.dataVerifier.stations.length === 0) { // make API call to get station data
      this.apiService.isLoading = true;
      setTimeout(() => {this.mapStationsToTableData(); }, 2000);
    } else { // already cached
      this.mapStationsToTableData();
    }
  }

  /**
   * Maps the stations data to the table data format.
   * Each station is represented as an array of strings containing its name, availability of WiFi, parking, stepless access, elevator, and address.
   * The table data is then sorted alphabetically by station name.
   */
  private mapStationsToTableData(): void {
    if (this.dataVerifier.stations.length === 1) {
      this.apiService.isEmptyResults = false;
      this.currentTrainStation = this.dataVerifier.stations[0].name;
    } else {
      this.currentTrainStation = "";
      this.apiService.isEmptyResults = true;

      // show error if station could not be found
      if (this.dataVerifier.stations.length === 0) {
        this.dataVerifier.toggleErrorAlert('no_stations');
        this.apiService.isLoading = false;
        this.tableData = [];
        return;
      }
    }

    this.dataVerifier.toggleErrorAlert();
    this.apiService.isLoading = false;
    this.tableData = this.dataVerifier.stations.map((station: StationData): string[] => {
      const hasElevator: boolean = this.dataVerifier.elevators.some(elevator => elevator.stationnumber === station.number);
      return [
        station.name,
        station.hasWiFi ? '✔' : '❌',
        station.hasParking ? '✔' : '❌',
        station.hasSteplessAccess ? '✔' : '❌',
        hasElevator ? '✔' : '❌',
        `${station.mailingAddress.street}, ${station.mailingAddress.city}`
      ];
    }).sort((a, b) => a[0].localeCompare(b[0]));
  }
}
