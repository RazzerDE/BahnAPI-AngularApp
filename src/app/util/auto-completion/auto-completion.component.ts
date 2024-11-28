import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {DataVerifierService} from "../../services/data-verifier/data-verifier.service";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-auto-completion',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './auto-completion.component.html',
  styleUrl: './auto-completion.component.css'
})
export class AutoCompletionComponent {
  @Input() input_field: HTMLInputElement | undefined;
  @Input() position: 'top' | 'bottom' = 'bottom';
  @ViewChild('autoCompletionMenu') autoCompletionMenu!: ElementRef;

  constructor(protected dataVerifier: DataVerifierService) {}

/**
* Aktualisiert den Stationswert, wenn ein Benutzer eine Station aus dem Auto-Vervollständigungsmenü auswählt.
*
* @param station_name - Der Name der vom Benutzer ausgewählten Station.
*/
  protected updateStationValue(station_name: string): void {
    this.dataVerifier.completion_name = station_name;

    // verstecke das auto-completion menu (user hat auf einen Eintrag geklickt)
    if (!this.autoCompletionMenu.nativeElement.classList.contains('hidden')) {
      this.autoCompletionMenu.nativeElement.classList.add('hidden');
    }

    // starte eine api abfrage durch Simulierung eines Tastendrucks
    if (this.input_field) {
      this.input_field.focus();
      const event: KeyboardEvent = new KeyboardEvent('keyup', {key: 'Enter',  code: 'Enter',  bubbles: true });
      setTimeout(() => { this.input_field!.dispatchEvent(event); }, 100);
    }
  }

}
