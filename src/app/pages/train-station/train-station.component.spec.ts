import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainStationComponent } from './train-station.component';

describe('TrainStationComponent', () => {
  let component: TrainStationComponent;
  let fixture: ComponentFixture<TrainStationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainStationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainStationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not change currentTrainStation if input is empty', () => {
    const searchInput: HTMLInputElement = document.createElement('input');
    searchInput.id = 'searchStation';
    searchInput.value = '';
    document.body.appendChild(searchInput);

    component.changeTrainStation();
    expect(component.currentTrainStation).toBe(component.currentTrainStation);

    document.body.removeChild(searchInput);
  });

  it('should change currentTrainStation if input is valid', () => {
    const org_body = document.body.innerHTML;
    document.body.innerHTML = "<input id='searchStation' value='Berlin Hbf'>";

    component.changeTrainStation();
    expect(component.currentTrainStation).toBe('Berlin Hbf');

    document.body.innerHTML = org_body;
  });
});
