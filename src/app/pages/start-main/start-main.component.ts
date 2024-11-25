import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
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
  protected readonly document: Document = document;

  protected tableHeader: string[] = ['Uhrzeit (Gepl. Abfahrt)', 'Gleis', 'Zugname', 'Zugart', 'Von Bahnhof', 'Nach Zielbahnhof'];
  protected tableData: string[][] = [];

  private today: Date = new Date();
  private date_string: string = this.today.toISOString().slice(2, 10).replace(/-/g, '') + ' ' + this.today.getHours().toString().padStart(2, '0');
  protected date_splitted: string[] = this.date_string.split(' ');

  protected end_station_name: string = '';
  protected start_station_name: string = 'Magdeburg Hbf';

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

    this.trainStationForm.valueChanges.subscribe(value => {
      if (this.showRoutePlaning) {
        console.log(value)
        this.start_station_name = value;
      }
    });
  }

  /**
   * Displays the timepicker and focuses on the input element for better keyboard navigation.
   */
  protected showTimepicker(): void { setTimeout(() => { this.input_time.nativeElement.focus(); }, 100); }

  /**
   * Toggles the visibility of the timepicker and updates the selected time.
   * @param close - Optional parameter to indicate if the timepicker should be closed.
   */
  protected toggleTimepicker(close?: boolean): void {
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
   */
  protected toggleRoutePlaning(): void {
    this.showRoutePlaning = !this.showRoutePlaning;
  }

  /**
   * Updates the train data based on the selected start and end stations and the selected time.
   * Makes an API request to fetch the timetable data and updates the table.
   */
  protected updateTrainData(): void {
    if (this.end_station_name === this.trainStationForm.value && !this.changedTime) { return; }
    if (this.trainStationForm.valid && !this.end_station_name) { this.end_station_name = this.trainStationForm.value; }

    // api request
    this.changedTime = true;
    this.apiService.isLoading = true;
    if (this.end_station_name != this.start_station_name) {
      this.apiService.getTimetableData(this.start_station_name, this.date_splitted[0], this.date_splitted[1].split(':')[0],
        this.end_station_name);
    } else { return this.mapStationsToTableData(); }

    // update table
    setTimeout(() => {this.mapStationsToTableData(); }, 2000);
  }

  /**
   * Determines if the search button should be disabled.
   *
   * The search button is disabled in the following cases:
   * - The time has not changed and
   * - The train station form is empty and
   * - The route planning section is shown but the end station name is empty.
   *
   * @returns {boolean} - Returns true if the search button should be disabled, false otherwise.
   */
  protected isSearchBtnDisabled(): boolean {
    return !this.changedTime && this.trainStationForm.value === '' && (!this.showRoutePlaning || this.end_station_name === '');
  }

  /**
   * Maps the station stops data to the table data format.
   * Updates the table data and handles error alerts if no train is found.
   */
  private mapStationsToTableData(): void {
    this.apiService.isLoading = false;

    // no train found
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

  /**
   * Formats the given time string to "HH:MM" format.
   * @param pt - The time string in the format "YYYYMMDDHHMM".
   * @returns The formatted time string.
   */
  private formatTime(pt: string): string {
    return `${pt.slice(6, 8)}:${pt.slice(8, 10)}`;
  }
}
