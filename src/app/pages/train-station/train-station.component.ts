import {Component, OnInit} from '@angular/core';
import {TableComponent} from "../../util/table/table.component";
import {ApiService} from "../../services/api-service/api.service";
import {StationData} from "../../services/api-service/types/station-data";
import {NavigationEnd, Router} from "@angular/router";
import {DataVerifierService} from "../../services/data-verifier/data-verifier.service";
import {AutoCompletionComponent} from "../../util/auto-completion/auto-completion.component";

@Component({
  selector: 'app-train-station',
  standalone: true,
  imports: [
    TableComponent,
    AutoCompletionComponent
  ],
  templateUrl: './train-station.component.html',
  styleUrl: './train-station.component.css'
})
export class TrainStationComponent implements OnInit{
  public currentTrainStation: string = "";
  public tableHeaders: string[] = ['Station', 'WLAN', 'Parkplatz', 'barrierefrei', 'Fahrstuhl', 'Adresse']
  public tableData: string[][] = [];

  constructor(protected apiService: ApiService, private router: Router, protected dataVerifier: DataVerifierService) {
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
        // Lädt die Daten neu, wenn die Seite durch einen Redirect besucht wird
        this.apiService.isLoading = true;
      }
    });
  }

  /**
   * Ändert den aktuellen Bahnhof basierend auf dem im Suchfeld eingegebenen Wert.
   * Wenn die Eingabe leer ist oder mit einem Leerzeichen beginnt, wird der aktuelle Bahnhof nicht aktualisiert.
   */
  changeTrainStation(): void {
    const searchInput = document.getElementById('searchStation') as HTMLInputElement;
    const error_box: HTMLSpanElement = document.getElementById('error_trainstation') as HTMLSpanElement;
    if (error_box && !error_box.classList.contains('hidden')) {
      error_box.classList.add('hidden');
    }

    if (searchInput.value === '' || searchInput.value.startsWith(' ')) {
      this.apiService.getDataFromStations();
    } else { // überprüfe ob die station bereits im Cache liegt
      const searchValue = searchInput.value.toLowerCase();
      const cachedStation = this.dataVerifier.stations.find(station => station.name.toLowerCase() === searchValue);

      if (cachedStation) {
        this.dataVerifier.stations = [cachedStation];
        this.mapStationsToTableData();
      } else {
        this.apiService.getDataByStation(searchValue);
      }
    }

    // update die aktuelle Zugstation
    this.currentTrainStation = 'Lädt..';
    this.apiService.isLoading = true;
    setTimeout(() => {this.mapStationsToTableData(); }, 1000);
  }

  /**
   * Erstellt die Tabellen-Daten mit den Bahnhofsdaten.
   */
  generateStationsTable(): void {
    if (this.dataVerifier.stations.length === 0) { // API-Abfrage wenn keine Stationen vorhanden sind
      this.apiService.isLoading = true;
      setTimeout(() => {this.mapStationsToTableData(); }, 2000);
    } else { // liegt bereits im Cache
      this.mapStationsToTableData();
    }
  }

  /**
   * Wandelt die Bahnhofs-Daten in das Tabellen-Datenformat um.
   * Jeder Bahnhof wird als ein Array von Strings dargestellt, das seinen Namen, die Verfügbarkeit von WLAN, Parkplätzen, barrierefreiem Zugang, Fahrstuhl und Adresse enthält.
   * Die Tabellendaten werden dann alphabetisch nach Bahnhofsnamen sortiert.
   */
  private mapStationsToTableData(): void {
    if (this.dataVerifier.stations.length === 1) {
      this.apiService.isEmptyResults = false;
      this.currentTrainStation = this.dataVerifier.stations[0].name;
    } else {
      this.currentTrainStation = "";
      this.apiService.isEmptyResults = true;

      // zeige einen Fehler an, wenn keine Stationen gefunden wurden
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
