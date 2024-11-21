import {Component, Input} from '@angular/core';
import {NgClass, NgOptimizedImage} from "@angular/common";
import {ApiService} from "../../services/api-service/api.service";

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

  constructor(protected apiService: ApiService) {}
}
