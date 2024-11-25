import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, Router, RouterLink} from "@angular/router";
import {NgClass} from "@angular/common";
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {TableComponent} from "../../util/table/table.component";
import {ApiService} from "../../services/api-service/api.service";
import {Schedule} from "../../services/api-service/types/timetables";
import {DataVerifierService} from "../../services/data-verifier/data-verifier.service";

@Component({
  selector: 'app-start-main',
  standalone: true,
  imports: [
    RouterLink,
    NgClass,
    ReactiveFormsModule,
    TableComponent,
    FormsModule
  ],
  templateUrl: './start-main.component.html',
  styleUrl: './start-main.component.css'
})
export class StartMainComponent implements OnInit {
  trainStationForm: FormControl<any> = new FormControl('', Validators.required);
  @ViewChild('timepicker') timepicker!: ElementRef;
  @ViewChild('start_time') input_time!: ElementRef;
  @ViewChild('selectTimeToggle') selectTimeToggle!: ElementRef;

  protected currentTime: string;
  protected changedTime: boolean = false;
  protected showRoutePlaning: boolean = false;

  protected tableHeader: string[] = ['Uhrzeit (Gepl. Abfahrt)', 'Gleis', 'Zugname', 'Zugart', 'Von Bahnhof', 'Nach Zielbahnhof'];
  protected tableData: string[][] = [];

  private today: Date = new Date();
  private date_string: string = this.today.toISOString().slice(2, 10).replace(/-/g, '') + ' ' + this.today.getHours().toString().padStart(2, '0');
  protected date_splitted: string[] = this.date_string.split(' ');

  private end_station_name: string = '';
  private start_station_name: string = 'Magdeburg Hbf';

  constructor(private apiService: ApiService, private router: Router, private dataVerifier: DataVerifierService) {
    this.currentTime = `Heute, um ${this.date_splitted[1]}:00 Uhr`;

    // update table
    this.apiService.isLoading = true;
    this.apiService.getTimetableData(this.start_station_name, this.date_splitted[0], this.date_splitted[1].split(':')[0]);
    setTimeout(() => {this.mapStationsToTableData(); }, 1000);
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // set loading to true after angular router navigation
        this.apiService.isLoading = true;
      }
    });
  }

  showTimepicker(): void {
    setTimeout(() => { this.input_time.nativeElement.focus(); }, 100);
  }

  toggleTimepicker(close?: boolean): void {
    if (this.date_splitted[1] === this.input_time.nativeElement.value.replace(':00:00', ':00')) { return; }

    if (close && !this.timepicker.nativeElement.classList.contains('hidden')) {
      // close timepicker manually if the user closes it with enter key
      this.timepicker.nativeElement.classList.add('hidden');
      this.selectTimeToggle.nativeElement.click();

      this.changedTime = true;
    }

    this.date_splitted[1] = this.input_time.nativeElement.value;
    this.currentTime = `Heute, um ${this.date_splitted[1]} Uhr`;
  }

  /**
   * Toggles the visibility of the route planning section.
   * When called, it switches the `showRoutePlaning` flag between true and false.
   */
  toggleRoutePlaning(): void {
    this.showRoutePlaning = !this.showRoutePlaning;
  }

  /**
   * Validates the train station form and toggles the invalidTrainstation flag.
   * If the form is invalid, sets the invalidTrainstation flag to true and returns.
   */
  getTrainstationData(): void {
    if (this.end_station_name === this.trainStationForm.value && !this.changedTime) { return; }

    if (this.trainStationForm.valid) {
      this.end_station_name = this.trainStationForm.value;
    }

    // api request
    this.changedTime = true;
    this.apiService.isLoading = true;
    this.apiService.getTimetableData(this.start_station_name, this.date_splitted[0], this.date_splitted[1].split(':')[0],
                                     this.end_station_name);

    // update table
    setTimeout(() => {this.mapStationsToTableData(); }, 2000);
  }

  private mapStationsToTableData(): void {
    this.apiService.isLoading = false;

    // no train found
    const alert_box: HTMLDivElement = document.getElementById('invalidAlert') as HTMLDivElement;
    if (!this.dataVerifier.station_stops || (this.end_station_name === this.start_station_name)) {
      const alert_title: HTMLHeadingElement = document.getElementById('alert_title') as HTMLHeadingElement;
      const alert_info: HTMLSpanElement = document.getElementById('alert_info') as HTMLSpanElement;
      this.tableData = [];
      this.apiService.isEmptyResults = true;

      if (this.end_station_name === this.start_station_name) {
        alert_title.innerText = 'Ungültige Stationen';
        alert_info.innerText = 'Die Start-Station kann nicht gleich der Ziel-Station sein.';
      } else {
        alert_title.innerText = 'Keine Züge gefunden';
        alert_info.innerText = 'Es wurden keine Züge für die angegebenen Stationen gefunden.';
      }

      alert_box.classList.remove('hidden');
      return;
    }

    if (!alert_box.classList.contains('hidden')) {
      alert_box.classList.add('hidden');
    }

    this.tableData = this.dataVerifier.station_stops!.s
      .filter((train: Schedule) => train.dp)
      .map((train: Schedule): string[] => {
        return [
          this.formatTime(train.dp!.pt),
          train.dp!.pp,
          train.tl.c + ' ' + train.tl.n,
          train.tl.c,
          this.start_station_name,
          this.end_station_name ? this.end_station_name : train.dp!.ppth.split('|').pop() || ''
        ];
      }).sort((a, b) => a[0].localeCompare(b[0]));
  }

  private formatTime(pt: string): string {
    const hours = pt.slice(6, 8);
    const minutes = pt.slice(8, 10);
    return `${hours}:${minutes}`;
  }


  protected readonly document = document;
}
