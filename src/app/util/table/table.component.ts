import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {NgClass, NgOptimizedImage} from "@angular/common";
import {ApiService} from "../../services/api-service/api.service";
import {DataVerifierService} from "../../services/data-verifier/data-verifier.service";

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    NgClass,
    NgOptimizedImage
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  @Input() columns: string[] = [];
  @Input() rows: string[][] = [];
  @Input() small: boolean = false;

  @ViewChild('invalidAlert') alert_box!: ElementRef;

  constructor(protected apiService: ApiService, private dataVerifier: DataVerifierService) {
    this.apiService.isInvalidKey.subscribe((_value: boolean) => {
      this.apiService.isLoading = false;

      setTimeout(() => {
        const alert_title = document.getElementById('alert_title') as HTMLHeadingElement;
        const alert_info = document.getElementById('alert_info') as HTMLSpanElement;

        if (this.alert_box && this.alert_box.nativeElement.classList.contains('hidden')) {
          alert_title.innerText = 'API-Credentials invalid!';
          alert_info.innerHTML = 'Please check if the API-credentials in <code>src/app/services/types/environment.ts</code> are correct';
          this.alert_box.nativeElement.classList.remove('hidden');
        }

        this.dataVerifier.stations = [];
        this.dataVerifier.elevators = [];
      }, 50);

    });
  }
}
