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

      if (this.alert_box && this.alert_box.nativeElement.classList.contains('hidden')) {
        this.alert_box.nativeElement.classList.remove('hidden');
      }

      this.dataVerifier.stations = [];
      this.dataVerifier.elevators = [];

    });
  }
}
