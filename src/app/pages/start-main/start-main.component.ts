import {Component} from '@angular/core';
import {RouterLink} from "@angular/router";
import {NgClass} from "@angular/common";
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {Datepicker, DatepickerOptions} from "flowbite";

@Component({
  selector: 'app-start-main',
  standalone: true,
  imports: [
    RouterLink,
    NgClass,
    ReactiveFormsModule
  ],
  templateUrl: './start-main.component.html',
  styleUrl: './start-main.component.css'
})
export class StartMainComponent {
  trainStationForm: FormControl<any> = new FormControl('', Validators.required);

  protected currentDate: string = 'Datum festlegen';
  protected selectedDate: Date | null = null;
  protected invalidTrainstation: boolean = false
  protected showRoutePlaning: boolean = false;
  protected pickedDate: string;
  private datepicker: Datepicker | undefined;

  constructor() {
    this.pickedDate = new Date().toLocaleDateString('en-US');
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
      onHide: () => { this.setTrainStationDate(); }
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
   * Otherwise, toggles the invalidTrainstation flag.
   */
  getTrainstationData(): void {
    if (this.trainStationForm.invalid) {
      this.invalidTrainstation = true;
      return;
    }

    this.invalidTrainstation = !this.invalidTrainstation;
  }


}
