import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {NgClass} from "@angular/common";
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {TableComponent} from "../../util/table/table.component";
import {ApiService} from "../../services/api-service/api.service";
import {Arrival, Departure, Schedule} from "../../services/api-service/types/timetables";
import {DataVerifierService} from "../../services/data-verifier/data-verifier.service";
import {AutoCompletionComponent} from "../../util/auto-completion/auto-completion.component";

@Component({
  selector: 'app-start-main',
  standalone: true,
  imports: [
    NgClass,
    ReactiveFormsModule,
    TableComponent,
    FormsModule,
    AutoCompletionComponent
  ],
  templateUrl: './start-main.component.html',
  styleUrl: './start-main.component.css'
})
export class StartMainComponent implements OnInit {
  trainStationForm: FormControl<any> = new FormControl('', Validators.required);

  @ViewChild('timepicker') timepicker!: ElementRef;
  @ViewChild('start_time') input_time!: ElementRef;
  @ViewChild('selectTimeToggle') selectTimeToggle!: ElementRef;

  protected changedTime: boolean = false;
  protected showRoutePlaning: boolean = false;
  protected showArrivalTime: boolean = false;
  protected readonly document: Document = document;

  protected tableHeader: string[] = ['Uhrzeit (Gepl. Abfahrt)', 'Gleis', 'Zugname', 'Zugart', 'Von Bahnhof', 'Nach Zielbahnhof'];
  protected tableData: string[][] = [];

  private today: Date = new Date();
  private date_string: string = this.today.toISOString().slice(2, 10).replace(/-/g, '') + ' ' + this.today.getHours().toString().padStart(2, '0');
  protected date_splitted: string[] = this.date_string.split(' ');
  protected currentTimeHours: string = this.date_splitted[1] + ':00';

  protected end_station_name: string = '';
  protected start_station_name: string = 'Magdeburg Hbf';

  constructor(private apiService: ApiService, private router: Router, protected dataVerifier: DataVerifierService) {
    // Tabelle updaten
    this.apiService.isLoading = true;
    this.apiService.getTimetableData(this.start_station_name, this.date_splitted[0], this.date_splitted[1].split(':')[0]);
    setTimeout(() => {this.mapStationsToTableData(); }, 1000);
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Aktiviere den Ladebildschirm, wenn die Seite gewechselt wird
        this.apiService.isLoading = true;
      }
    });

    this.trainStationForm.valueChanges.subscribe(value => {
      if (this.showRoutePlaning) {
        // start-station_name updaten, wenn RoutePlaning aktiv ist
        this.start_station_name = value;
      }
    });
  }

  /**
   * Zeigt den Zeitpicker an und fokussiert das Eingabeelement für eine bessere Tastaturnavigation.
   */
  protected showTimepicker(): void { setTimeout(() => { this.input_time.nativeElement.focus(); }, 100); }

  /**
   * Schaltet die Sichtbarkeit des Zeitpickers um und aktualisiert die ausgewählte Zeit.
   * @param close - Optionaler Parameter, um anzugeben, ob der Zeitpicker geschlossen werden soll.
   */
  protected toggleTimepicker(close?: boolean): void {
    if (close && !this.timepicker.nativeElement.classList.contains('hidden')) {
      // Zeitpicker manuell schließen, wenn der Benutzer ihn mit der Eingabetaste schließt
      this.timepicker.nativeElement.classList.add('hidden');
      this.selectTimeToggle.nativeElement.click();
      this.changedTime = true;
    }

    // Die API kann nur die volle Stunde verarbeiten, daher filtern wir später
    this.currentTimeHours = this.input_time.nativeElement.value;
    this.date_splitted[1] = this.currentTimeHours;
  }

  /**
   * Schaltet die Sichtbarkeit des Routenplanungsabschnitts um.
   */
  protected toggleRoutePlaning(): void {
    this.showRoutePlaning = !this.showRoutePlaning;
  }

  /**
   * Aktualisiert die Zugdaten basierend auf den ausgewählten Start- und Endbahnhöfen und der ausgewählten Zeit.
   * Führt eine API-Anfrage durch, um die Fahrplandaten abzurufen und die Tabelle zu aktualisieren.
   */
  protected updateTrainData(): void {
    if (this.end_station_name === this.trainStationForm.value && !this.changedTime) { return; }
    if (this.trainStationForm.valid && !this.end_station_name) { this.end_station_name = this.trainStationForm.value; }

    // api abfrage
    this.changedTime = true;
    this.apiService.isLoading = true;
    if (this.end_station_name != this.start_station_name) {
      this.apiService.getTimetableData(this.start_station_name, this.date_splitted[0], this.date_splitted[1].split(':')[0],
        this.end_station_name);
    } else { return this.mapStationsToTableData(); }

    // Tabelle updaten
    setTimeout(() => {this.mapStationsToTableData(); }, 2000);
  }

  /**
   * Bestimmt, ob die Suchschaltfläche deaktiviert sein sollte.
   *
   * Die Suchschaltfläche ist in den folgenden Fällen deaktiviert:
   * - Die Zeit hat sich nicht geändert und
   * - Das Zugstationsformular ist leer und
   * - Der Routenplanungsabschnitt wird angezeigt, aber der Name des Endbahnhofs ist leer.
   *
   * @returns {boolean} - Gibt true zurück, wenn die Suchschaltfläche deaktiviert sein sollte, andernfalls false.
   */
  protected isSearchBtnDisabled(): boolean {
    return !this.changedTime && this.trainStationForm.value === '' && (!this.showRoutePlaning || this.end_station_name === '');
  }

  /**
   * Aktualisiert die Tabellenüberschrift basierend auf dem Wert von `showArrivalTime`.
   */
   protected changeTableHeader(): void {
    if (this.showArrivalTime) {
      this.tableHeader[0] = 'Uhrzeit (Gepl. Ankunft)';
    } else {
      this.tableHeader[0] = 'Uhrzeit (Gepl. Abfahrt)';
    }

    this.apiService.isLoading = true;
    this.apiService.getTimetableData(this.start_station_name, this.date_splitted[0], this.date_splitted[1].split(':')[0],
      this.end_station_name ? this.end_station_name : undefined, true);
    setTimeout(() => {this.mapStationsToTableData(); }, 2000);
  }

  /**
   * Ordnet die Stationsstopps-Daten dem Tabellenformat zu.
   * Aktualisiert die Tabellendaten und behandelt Fehlerwarnungen, wenn kein Zug gefunden wird.
   */
  private mapStationsToTableData(): void {
    this.apiService.isLoading = false;

    // kein zug gefunden
    if (!this.dataVerifier.station_stops || this.dataVerifier.station_stops.s.length === 0 ||
        this.end_station_name === this.start_station_name) {
      this.tableData = [];
      this.apiService.isEmptyResults = true;

      if (this.end_station_name === this.start_station_name) {
        this.dataVerifier.toggleErrorAlert('same_station');
      } else {
        this.dataVerifier.toggleErrorAlert('no_stations');
      }
      return;
    }

    this.dataVerifier.toggleErrorAlert();
    this.tableData = this.dataVerifier.station_stops!.s
      .filter((train: Schedule) => {
        const time: Departure | Arrival | undefined = this.showArrivalTime ? train.ar : train.dp;
        return time && (parseInt(time!.pt.slice(-4)) >= parseInt(this.currentTimeHours.replace(':', '')));
      })
      .map((train: Schedule): string[] => {
        const time: Departure | Arrival | undefined = this.showArrivalTime ? train.ar : train.dp;
        return [
          this.dataVerifier.formatTime(time!.pt),
          time!.pp,
          train.tl.c + ' ' + train.tl.n,
          train.tl.c,
          this.start_station_name,
          this.end_station_name ? this.end_station_name : time!.ppth.split('|').pop() || ''
        ];
      }).sort((a: string[], b: string[]): number => a[0].localeCompare(b[0]));

    if (this.tableData.length === 0) {
      this.apiService.isEmptyResults = true;
      this.dataVerifier.toggleErrorAlert('no_stations');
    }
  }

}
