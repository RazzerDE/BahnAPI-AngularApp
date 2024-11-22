import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, Router, RouterLink} from "@angular/router";
import {NgClass} from "@angular/common";
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Datepicker, DatepickerOptions} from "flowbite";
import {TableComponent} from "../../util/table/table.component";
import {ApiService} from "../../services/api-service/api.service";
import {Schedule} from "../../services/api-service/types/timetables";

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
  @ViewChild('invalidAlert') alert_box!: ElementRef;
  @ViewChild('time-range-container') timepicker!: ElementRef;

  protected currentTime: string;
  protected changedTime: boolean = true;
  protected showRoutePlaning: boolean = false;

  protected tableHeader: string[] = ['Uhrzeit (Gepl. Abfahrt)', 'Gleis', 'Zugname', 'Zugart', 'Von Bahnhof', 'Nach Zielbahnhof'];
  protected tableData: string[][] = [];

  private today: Date = new Date();
  private date_string: string = this.today.toISOString().slice(2, 10).replace(/-/g, '') + ' ' + this.today.getHours().toString().padStart(2, '0');
  protected date_splitted: string[] = this.date_string.split(' ');

  private end_station_name: string = '';
  private start_station_name: string = 'Magdeburg Hbf';

  constructor(private apiService: ApiService, private router: Router) {
    this.currentTime = `Heute, ab ${this.date_splitted[1]}:00`;

    // update table
    this.apiService.isLoading = true;
    this.apiService.getTimetableData(this.start_station_name, this.date_splitted[0], this.date_splitted[1]);
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
  }

  toggleTimepicker(close?: boolean): void {
    const timepicker: HTMLDivElement = document.getElementById('time-range-container') as HTMLDivElement;
    const input_time: HTMLInputElement = document.getElementById('start-time') as HTMLInputElement;
    if (this.date_splitted[1] === input_time.value.replace(':00:00', ':00')) { return; }

    console.log(timepicker.classList.contains('hidden'));
    if (close && !timepicker.classList.contains('hidden')) {
      timepicker.classList.add('hidden');
    }


    this.date_splitted[1] = input_time.value;
    this.currentTime = `Heute, ab ${this.date_splitted[1]}`;

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
    if (this.end_station_name === this.trainStationForm.value) { return; }

    this.end_station_name = this.trainStationForm.value;
    this.tableHeader[0] = this.tableHeader[0].replace('Abfahrt', 'Ankunft');

    // api request
    this.apiService.isLoading = true;
    this.apiService.getTimetableData(this.end_station_name, this.date_splitted[0], this.date_splitted[1]);

    // update table
    setTimeout(() => {this.mapStationsToTableData(); }, 2000);
  }

  private mapStationsToTableData(): void {
    this.apiService.isLoading = false;

    // no train found
    if (!this.apiService.station_stops || (this.start_station_name && this.end_station_name)) {
      this.alert_box.nativeElement.classList.remove('hidden');
      return;
    }

    // this.alert_box.nativeElement.classList.add('hidden');
    this.tableData = this.apiService.station_stops!.s
      .filter((train: Schedule) => train.dp)
      .map((train: Schedule): string[] => {
        return [
          this.formatTime(train.dp!.pt),
          train.dp!.pp,
          train.tl.c + ' ' + train.tl.n,
          train.tl.c,
          // Start station
          this.start_station_name,
          // End station
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
