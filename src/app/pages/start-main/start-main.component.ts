import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterLink} from "@angular/router";
import {NgClass} from "@angular/common";
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
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
    TableComponent
  ],
  templateUrl: './start-main.component.html',
  styleUrl: './start-main.component.css'
})
export class StartMainComponent implements OnInit {
  trainStationForm: FormControl<any> = new FormControl('', Validators.required);

  protected currentDate: string = 'Datum festlegen';
  protected invalidTrainstation: boolean = false
  protected showRoutePlaning: boolean = false;
  protected pickedDate: string;
  private datepicker: Datepicker | undefined;

  protected tableHeader: string[] = ['Uhrzeit', 'Zugname', 'Zugart', 'Herkunftsbahnhof', 'Wunschbahnhof', 'Gleis'];
  protected tableData: string[][] = [];

  private isTableRefreshActive: boolean = false;
  private end_station_name: string = 'Magdeburg Hbf';
  private start_station_name: string = '';

  constructor(private apiService: ApiService, private router: Router) {
    const temp_date = new Date();
    this.pickedDate = temp_date.toLocaleDateString('en-US');

    this.apiService.isLoading = true;
    if (this.apiService.station_stops.length === 0) {
      this.apiService.getTimetableData(this.end_station_name, temp_date.toISOString().slice(2, 10).replace(/-/g, ''),
        temp_date.getHours().toString().padStart(2, '0'));
    }

    this.generateStationsTable();
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // set loading to true after angular router navigation
        this.apiService.isLoading = true;
      }
    });
  }

  /**
   * Opens the datepicker and initializes it with the specified options.
   * If the datepicker is not already active, it will be focused and a custom event listener will be added.
   * The datepicker will automatically select today's date and apply custom styles to the selected date cell.
   * When the datepicker is hidden, the selected date will be set in the train station form.
   */
  openDatepicker(): void {
    const datepickerElement = document.getElementById('inline-datepicker');
    const options: DatepickerOptions = {
      minDate: new Date().toLocaleDateString('en-US'),
      autohide: true,
      format: 'mm/dd/yyyy',
      autoSelectToday: 1,
      // onHide: () => { this.setTrainStationDate(); } currently broken in flowbite
    };
    this.datepicker = new Datepicker(datepickerElement, options);
    const datepickerInput = document.querySelector('.datepicker');

    if (datepickerInput) { // another bypass for flowbite because "autoSelectToday" doesn't work as it should.
      const cells: NodeListOf<HTMLElement> = datepickerInput.querySelectorAll('.datepicker-cell');
      for (let i: number = 0; i < cells.length; i++) {
        if (cells[i].textContent === new Date().getDate().toString()) {
          cells[i].classList.add('dark:bg-primary-600', 'bg-primary-700');
          break;
        }
      }
    }

    if (datepickerElement) {
      if (!datepickerElement.classList.contains('is-active')) {
        datepickerElement.dispatchEvent(new Event('focus'));

        // add custom listener because the ** blowbite component doesn't redirect his damn events
        // TODO Maybe remove in future
        if (datepickerInput && !datepickerInput.hasAttribute('data-listener-added')) {
          datepickerInput.addEventListener('click', () => { this.setTrainStationDate(); });
          datepickerElement.setAttribute('data-listener-added', 'true');
        }
      }

      datepickerElement.classList.toggle('is-active');
    }
  }

  /**
   * Toggles the visibility of the route planning section.
   * When called, it switches the `showRoutePlaning` flag between true and false.
   */
  toggleRoutePlaning(): void {
    this.showRoutePlaning = !this.showRoutePlaning;
  }

  setTrainStationDate(): void {
    if (!this.datepicker) { return; }
    if (!this.datepicker.getDate()) { return; }

    const date = new Date(this.datepicker.getDate() as string);
    this.currentDate = date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
    this.pickedDate = date.toLocaleDateString('en-US');
  }

  /**
   * Validates the train station form and toggles the invalidTrainstation flag.
   * If the form is invalid, sets the invalidTrainstation flag to true and returns.
   */
  getTrainstationData(): void {
    if (this.trainStationForm.invalid) {
      this.invalidTrainstation = true;
      return;
    }

  }

  private generateStationsTable(): void {
    if (this.apiService.station_stops.length === 0) { // make API call to get station data
      this.apiService.isLoading = true;
      setTimeout(() => {this.mapStationsToTableData(); }, 2000);
    } else { // already cached
      this.mapStationsToTableData();
    }

    // update the table every 5s
    if (!this.isTableRefreshActive) {
      // setInterval(() => { this.mapStationsToTableData(); }, 5000);
    }
  }

  private mapStationsToTableData(): void {
    this.apiService.isLoading = false;
    this.tableData = this.apiService.station_stops
      .filter((train: Schedule) => train.ar)
      .map((train: Schedule): string[] => {
        return [
          this.formatTime(train.ar!.pt),
          train.tl.c + ' ' + train.tl.n,
          train.tl.c,
          train.ar!.ppth.split('|')[0],
          this.end_station_name,
          train.ar!.pp
        ];
      }).sort((a, b) => a[0].localeCompare(b[0]));
  }

  private formatTime(pt: string): string {
    const hours = pt.slice(6, 8);
    const minutes = pt.slice(8, 10);
    return `${hours}:${minutes}`;
  }


}
