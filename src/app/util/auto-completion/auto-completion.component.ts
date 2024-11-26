import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {DataVerifierService} from "../../services/data-verifier/data-verifier.service";

@Component({
  selector: 'app-auto-completion',
  standalone: true,
  imports: [],
  templateUrl: './auto-completion.component.html',
  styleUrl: './auto-completion.component.css'
})
export class AutoCompletionComponent {
  @Input() input_field: HTMLInputElement | undefined;
  @ViewChild('autoCompletionMenu') autoCompletionMenu!: ElementRef;

  constructor(protected dataVerifier: DataVerifierService) {}

  /**
   * Updates the station value when a user selects a station from the auto-completion menu.
   *
   * @param station_name - The name of the station selected by the user.
   */
  protected updateStationValue(station_name: string): void {
    this.dataVerifier.completion_name = station_name;

    // hide the auto-completion menu (user clicked on an entry)
    if (!this.autoCompletionMenu.nativeElement.classList.contains('hidden')) {
      this.autoCompletionMenu.nativeElement.classList.add('hidden');
    }

    // start api call by simulating an enter key press
    if (this.input_field) {
      this.input_field.focus();
      const event: KeyboardEvent = new KeyboardEvent('keyup', {key: 'Enter',  code: 'Enter',  bubbles: true });
      setTimeout(() => { this.input_field!.dispatchEvent(event); }, 100);
    }
  }

}
