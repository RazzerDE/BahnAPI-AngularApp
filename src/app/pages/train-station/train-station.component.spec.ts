import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrainStationComponent } from './train-station.component';
import { ApiService } from '../../services/api-service/api.service';
import { Elevator } from "../../services/api-service/types/elevators";
import { StationData } from "../../services/api-service/types/station-data";
import { BehaviorSubject } from "rxjs";
import { DataVerifierService } from "../../services/data-verifier/data-verifier.service";
import {NavigationEnd} from "@angular/router";

describe('TrainStationComponent', () => {
  let component: TrainStationComponent;
  let fixture: ComponentFixture<TrainStationComponent>;
  let apiService: ApiService;
  let dataVerifier: DataVerifierService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainStationComponent],
      providers: [
        {
          provide: ApiService,
          useValue: {
            stations: [],
            elevators: [],
            isLoading: false,
            isInvalidKey: new BehaviorSubject<boolean>(false),
            getDataFromStations: jest.fn(),
            checkStationsForElevator: jest.fn(),
            getDataByStation: jest.fn(),
          },
        },
        {
          provide: DataVerifierService,
          useValue: {
            stations: [],
            elevators: [],
            current_station: undefined,
            toggleErrorAlert: jest.fn(),
          }
        }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TrainStationComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    dataVerifier = TestBed.inject(DataVerifierService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getDataFromStations if input is empty', () => {
    const searchInput = document.createElement('input');
    searchInput.id = 'searchStation';
    searchInput.value = '';
    document.body.appendChild(searchInput);

    component.changeTrainStation();
    expect(apiService.getDataFromStations).toHaveBeenCalled();

    document.body.removeChild(searchInput);
  });

  it('should call getDataByStation if input is valid and not cached', () => {
    const org_body: string = document.body.innerHTML;
    document.body.innerHTML = '<input id="searchStation" value="Berlin Hbf"><span id="error_trainstation"></span>';

    component.changeTrainStation();
    expect(apiService.getDataByStation).toHaveBeenCalledWith('berlin hbf');

    document.body.innerHTML = org_body;
  });

  it('should call getDataByStation if input is valid and not cached', () => {
    const org_body: string = document.body.innerHTML;
    document.body.innerHTML = '<input id="searchStation" value="Berlin Hbf">';
    dataVerifier.stations = [{name: 'Berlin Hbf', hasWiFi: true, hasParking: true, hasSteplessAccess: true,
      mailingAddress: {street: 'Street', city: 'City', zipcode: '39126'}, number: 1}] as unknown as StationData[];

    jest.useFakeTimers();
    component.changeTrainStation();
    jest.advanceTimersByTime(1000);
    expect(dataVerifier.stations.length).toEqual(1);

    document.body.innerHTML = org_body;
  });

  it('should generate table data if stations are available', () => {
    dataVerifier.stations = [{name: 'Berlin Hbf', hasWiFi: true, hasParking: true, hasSteplessAccess: true,
      mailingAddress: {street: 'Street', city: 'City', zipcode: '39126'}, number: 1},] as unknown as StationData[];
    dataVerifier.elevators = [{ stationnumber: 1 }] as Elevator[];

    component.generateStationsTable();
    expect(component.tableData.length).toBe(1);
    expect(component.tableData[0][0]).toBe('Berlin Hbf');
  });

  it('should call mapStationsToTableData after 2 seconds if stations are not available', () => {
    jest.useFakeTimers();
    component.generateStationsTable();
    jest.advanceTimersByTime(2000);
    expect(apiService.isLoading).toBe(false);
  });

  it('should map stations to table data correctly', () => {
    dataVerifier.stations = [{name: 'Berlin Hbf', hasWiFi: true, hasParking: true, hasSteplessAccess: true,
      mailingAddress: {street: 'Street', city: 'City', zipcode: '39126'}, number: 1},] as unknown as StationData[];
    dataVerifier.elevators = [{ stationnumber: 1 }] as Elevator[];

    (component as any).mapStationsToTableData();
    expect(component.tableData.length).toBe(1);
    expect(component.tableData[0][0]).toBe('Berlin Hbf');
  });

  it('should sort stations alphabetically by name', () => {
    dataVerifier.stations = [
      { name: 'Berlin Hbf', hasWiFi: true, hasParking: true, hasSteplessAccess: true, mailingAddress: { street: 'Street', city: 'City', zipcode: '39126' }, number: 1 },
      { name: 'Aachen Hbf', hasWiFi: true, hasParking: true, hasSteplessAccess: true, mailingAddress: { street: 'Street', city: 'City', zipcode: '52062' }, number: 2 }
    ] as unknown as StationData[];
    dataVerifier.elevators = [{ stationnumber: 1 }, { stationnumber: 2 }] as Elevator[];

    component.generateStationsTable();
    expect(component.tableData[0][0]).toBe('Aachen Hbf');
    expect(component.tableData[1][0]).toBe('Berlin Hbf');
  });

  it('should map stations to table data correctly', () => {
    dataVerifier.stations = [{
      name: 'Berlin Hbf',
      hasWiFi: true,
      hasParking: true,
      hasSteplessAccess: true,
      mailingAddress: { street: 'Street', city: 'City', zipcode: '39126' },
      number: 1
    }] as unknown as StationData[];
    dataVerifier.elevators = [{ stationnumber: 1 }] as Elevator[];

    (component as any).mapStationsToTableData();
    expect(component.tableData.length).toBe(1);
    expect(component.tableData[0]).toEqual([
      'Berlin Hbf',
      '✔',
      '✔',
      '✔',
      '✔',
      'Street, City'
    ]);
  });

  it('should map stations to table data correctly with false values', () => {
    dataVerifier.stations = [{
      name: 'Berlin Hbf',
      hasWiFi: false,
      hasParking: false,
      hasSteplessAccess: false,
      mailingAddress: { street: 'Street', city: 'City', zipcode: '39126' },
      number: 1
    }] as unknown as StationData[];
    dataVerifier.elevators = [{ stationnumber: 2 }] as Elevator[]; // No elevator for this station

    (component as any).mapStationsToTableData();
    expect(component.tableData.length).toBe(1);
    expect(component.tableData[0]).toEqual([
      'Berlin Hbf',
      '❌',
      '❌',
      '❌',
      '❌',
      'Street, City'
    ]);
  });

  it('should set isLoading to true on NavigationEnd event', () => {
    const navigationEnd = new NavigationEnd(0, 'http://localhost:4200/', 'http://localhost:4200/');
    (component as any).router.events.next(navigationEnd);
    expect(apiService.isLoading).toBe(true);
  });
});
