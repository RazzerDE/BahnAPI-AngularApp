import { Component } from '@angular/core';
import {TableComponent} from "../../util/table/table.component";

@Component({
  selector: 'app-train-station',
  standalone: true,
  imports: [
    TableComponent
  ],
  templateUrl: './train-station.component.html',
  styleUrl: './train-station.component.css'
})
export class TrainStationComponent {
  public currentTrainStation: string = "Mageburg Hbf";
  public tableHeaders: string[] = ['Adresse/Koordinaten', 'Betreiber', 'Internet vorhanden', 'barrierefrei', 'hat lokale Transportmöglichkeiten']
  public tableData: string[][] = [
    ['123 Main St , 74.0060° W', 'Company A', 'Yes', 'Yes', 'Yes']
  ];

  changeTrainStation(): void {
    const searchInput = document.getElementById('searchStation') as HTMLInputElement;
    if (searchInput.value === '' || searchInput.value.startsWith(' ')) {
      return;
    }
    this.currentTrainStation = searchInput.value;
  }
}
