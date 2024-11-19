import { Component } from '@angular/core';

@Component({
  selector: 'app-train-station',
  standalone: true,
  imports: [],
  templateUrl: './train-station.component.html',
  styleUrl: './train-station.component.css'
})
export class TrainStationComponent {
  public currentTrainStation: string = "Mageburg Hbf";

  changeTrainStation(): void {
    const searchInput = document.getElementById('searchStation') as HTMLInputElement;
    if (searchInput.value === '' || searchInput.value.startsWith(' ')) {
      return;
    }
    this.currentTrainStation = searchInput.value;
  }
}
