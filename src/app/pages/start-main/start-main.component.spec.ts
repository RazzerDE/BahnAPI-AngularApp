import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartMainComponent } from './start-main.component';
import {NavigationEnd, Router} from "@angular/router";
import {of} from "rxjs";
import {ApiService} from "../../services/api-service/api.service";
import {DataVerifierService} from "../../services/data-verifier/data-verifier.service";
import {Timetable} from "../../services/api-service/types/timetables";

describe('StartMainComponent', () => {
  let component: StartMainComponent;
  let fixture: ComponentFixture<StartMainComponent>;
  let apiService: ApiService;
  let dataVerifier: DataVerifierService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartMainComponent],
      providers: [
        { provide: Router, useValue: { events: of(new NavigationEnd(0, '', '')) } },
        { provide: ApiService, useValue: { getTimetableData: jest.fn(), isLoading: false,
            isInvalidKey: { subscribe: jest.fn() } } },
        { provide: DataVerifierService, useValue: { toggleErrorAlert: jest.fn(),
            formatTime: jest.fn().mockImplementation((pt: string) => `${pt.slice(6, 8)}:${pt.slice(8, 10)}`) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StartMainComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    dataVerifier = TestBed.inject(DataVerifierService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update start_station_name on trainStationForm value change when showRoutePlaning is true', () => {
    (component as any).showRoutePlaning = true;
    component.trainStationForm.setValue('New Station');
    expect((component as any).start_station_name).toBe('New Station');
  });

  it('should update start_station_name on trainStationForm value change when showRoutePlaning is true', () => {
    (component as any).showRoutePlaning = true;
    component.trainStationForm.setValue('New Station');
    expect((component as any).start_station_name).toBe('New Station');
  });

  it('should focus on input_time element when showTimepicker is called', () => {
    component.input_time = { nativeElement: { focus: jest.fn() } } as any;
    jest.useFakeTimers();
    (component as any).showTimepicker();
    jest.runAllTimers();
    expect(component.input_time.nativeElement.focus).toHaveBeenCalled();
  });

  it('should toggle timepicker visibility and update time', () => {
    const timepicker = { nativeElement: { classList: { contains: jest.fn().mockReturnValue(false), add: jest.fn() } } };
    const selectTimeToggle = { nativeElement: { click: jest.fn() } };
    const input_time = { nativeElement: { value: '12:00' } };

    component.timepicker = timepicker as any;
    component.selectTimeToggle = selectTimeToggle as any;
    component.input_time = input_time as any;

    (component as any).toggleTimepicker(true);

    expect(timepicker.nativeElement.classList.add).toHaveBeenCalledWith('hidden');
    expect(selectTimeToggle.nativeElement.click).toHaveBeenCalled();
    expect((component as any).changedTime).toBe(true);
    expect((component as any).currentTimeHours).toBe('12:00');
  });

  it('should toggle route planning visibility', () => {
    (component as any).showRoutePlaning = false;
    (component as any).toggleRoutePlaning();
    expect((component as any).showRoutePlaning).toBe(true);
  });

  it('should update train data', () => {
    const mapStationsToTableDataSpy = jest.spyOn(component as any, 'mapStationsToTableData');
    (component as any).trainStationForm.setValue('New Station');
    (component as any).start_station_name = 'Old Station';
    (component as any).end_station_name = '';
    (component as any).date_splitted = ['20230101', '12:00'];

    (component as any).updateTrainData();

    expect((component as any).changedTime).toBe(true);
    expect(apiService.isLoading).toBe(true);
    expect(apiService.getTimetableData).toHaveBeenCalledWith('Old Station', '20230101', '12', 'New Station');
    expect(mapStationsToTableDataSpy).not.toHaveBeenCalled();
  });

  it('should update train data and call getTimetableData', () => {
    const mapStationsToTableDataSpy = jest.spyOn(component as any, 'mapStationsToTableData');
    component.trainStationForm.setValue('New Station');
    (component as any).end_station_name = 'Old Station';
    (component as any).changedTime = false;

    (component as any).updateTrainData();

    expect((component as any).changedTime).toBe(true);
    expect(apiService.isLoading).toBe(true);
    expect(apiService.getTimetableData).toHaveBeenCalledWith('Magdeburg Hbf', (component as any).date_splitted[0],
      (component as any).date_splitted[1].split(':')[0], 'Old Station');
    expect(mapStationsToTableDataSpy).not.toHaveBeenCalled();
  });

  it('should not update train data if end station is the same and time has not changed', () => {
    const mapStationsToTableDataSpy = jest.spyOn(component as any, 'mapStationsToTableData');
    (component as any).start_station_name = 'Old Station';
    (component as any).end_station_name = (component as any).start_station_name;
    (component as any).changedTime = false;

    (component as any).updateTrainData();

    expect(mapStationsToTableDataSpy).toHaveBeenCalled();
  });

  it('should update train data and call mapStationsToTableData if end station is the same as start station', () => {
    component.trainStationForm.setValue('Magdeburg Hbf');
    (component as any).end_station_name = 'Magdeburg Hbf';
    (component as any).changedTime = false;

    (component as any).updateTrainData();

    expect(apiService.isLoading).toBe(true);
    expect(apiService.getTimetableData).toHaveBeenCalled();
  });

  it('should update table header based on showArrivalTime', () => {
    const mapStationsToTableDataSpy = jest.spyOn(component as any, 'mapStationsToTableData');
    const getTimetableDataSpy = jest.spyOn(apiService, 'getTimetableData');

    (component as any).showArrivalTime = true;
    (component as any).changeTableHeader();
    expect((component as any).tableHeader[0]).toBe('Time (Arrival)');
    expect(apiService.isLoading).toBe(true);
    expect(getTimetableDataSpy).toHaveBeenCalledWith('Magdeburg Hbf', (component as any).date_splitted[0], (component as any).date_splitted[1].split(':')[0], undefined, true);
    jest.runAllTimers();
    expect(mapStationsToTableDataSpy).toHaveBeenCalled();

    (component as any).showArrivalTime = false;
    (component as any).changeTableHeader();
    expect((component as any).tableHeader[0]).toBe('Time (Departure)');
    expect(apiService.isLoading).toBe(true);
    expect(getTimetableDataSpy).toHaveBeenCalledWith('Magdeburg Hbf', (component as any).date_splitted[0], (component as any).date_splitted[1].split(':')[0], undefined, true);
    jest.runAllTimers();
    expect(mapStationsToTableDataSpy).toHaveBeenCalled();
  });

  it('should call getTimetableData with undefined end_station_name if it is empty', () => {
    const getTimetableDataSpy = jest.spyOn(apiService, 'getTimetableData');
    (component as any).end_station_name = 'Magdeburg-Buckau';
    (component as any).showArrivalTime = false;

    (component as any).changeTableHeader();

    expect(getTimetableDataSpy).toHaveBeenCalledWith(
      'Magdeburg Hbf',
      (component as any).date_splitted[0],
      (component as any).date_splitted[1].split(':')[0],
      'Magdeburg-Buckau',
      true
    );
  });

  it('should map station stops data to table data format', () => {
    (component as any).currentTimeHours = '12:00'
    const toggleErrorAlertSpy = jest.spyOn(dataVerifier, 'toggleErrorAlert');
    dataVerifier.station_stops = {
      s: [
        {
          dp: { pt: '2301011300', pp: '2', ppth: 'Station B|Station C' },
          ar: { pt: '2301011400', pp: '3', ppth: 'Station B|Station C' },
          tl: { c: 'ICE', n: '123' }
        },
        {
          dp: { pt: '2301021300', pp: '4', ppth: 'Station A|Station D' },
          ar: { pt: '2301021400', pp: '5', ppth: 'Station A|Station D' },
          tl: { c: 'RE', n: '12' }
        }
      ]
    } as Timetable;

    (component as any).mapStationsToTableData();
    expect(apiService.isLoading).toBe(false);
    expect((component as any).tableData.length).toBe(2);
    expect((component as any).tableData[0]).toEqual(['13:00', '2', 'ICE 123', 'ICE', 'Magdeburg Hbf', 'Station C']);
    expect(toggleErrorAlertSpy).toHaveBeenCalled();

    (component as any).showArrivalTime = true;
    (component as any).mapStationsToTableData();
    expect(apiService.isLoading).toBe(false);
    expect((component as any).tableData.length).toBe(2);
    expect((component as any).tableData[0]).toEqual(['14:00', '3', 'ICE 123', 'ICE', 'Magdeburg Hbf', 'Station C']);
    expect(toggleErrorAlertSpy).toHaveBeenCalled();

    dataVerifier.station_stops = {s: []} as unknown as Timetable;
    (component as any).mapStationsToTableData();
    expect(apiService.isLoading).toBe(false);
    expect((component as any).tableData.length).toBe(0);
    expect(apiService.isEmptyResults).toBe(true);
    expect(toggleErrorAlertSpy).toHaveBeenCalledWith('no_stations');
  });

  it('should map station stops data to table data format with correct end station name', () => {
    (component as any).currentTimeHours = '12:00';
    (component as any).end_station_name = 'Station C';
    const toggleErrorAlertSpy = jest.spyOn(dataVerifier, 'toggleErrorAlert');
    dataVerifier.station_stops = {
      s: [
        {
          dp: { pt: '2301011300', pp: '2', ppth: 'Station B|Station C' },
          ar: { pt: '2301011400', pp: '3', ppth: 'Station B|Station C' },
          tl: { c: 'ICE', n: '123' }
        },
        {
          dp: { pt: '2301011400', pp: '3', ppth: '|' },
          tl: { c: 'ICE', n: '123' }
        }
      ]
    } as Timetable;

    (component as any).mapStationsToTableData();
    expect(apiService.isLoading).toBe(false);
    expect((component as any).tableData.length).toBe(2);
    expect((component as any).tableData[0][5]).toBe('Station C');
    expect(toggleErrorAlertSpy).toHaveBeenCalled();

    (component as any).end_station_name = '';
    (component as any).mapStationsToTableData();
    expect((component as any).tableData[1][5]).toBe('');
  });

  it('should handle empty tableData scenario', () => {
    const toggleErrorAlertSpy = jest.spyOn(dataVerifier, 'toggleErrorAlert');
    dataVerifier.station_stops = {
      s: [
        {
          dp: { pt: '2301011100', pp: '2', ppth: 'Station B|Station C' },
          tl: { c: 'ICE', n: '123' }
        }
      ]
    } as Timetable;

    (component as any).currentTimeHours = '12:00'; // Set current time to a value that will filter out the train
    (component as any).mapStationsToTableData();

    expect(apiService.isLoading).toBe(false);
    expect((component as any).tableData.length).toBe(0);
    expect(apiService.isEmptyResults).toBe(true);
    expect(toggleErrorAlertSpy).toHaveBeenCalledWith('no_stations');
  });

  it('should disable search button when showRoutePlaning is true and end_station_name is empty', () => {
    (component as any).changedTime = false;
    component.trainStationForm.setValue('');
    (component as any).showRoutePlaning = true;
    (component as any).end_station_name = '';

    expect((component as any).isSearchBtnDisabled()).toBe(true);
  });
});
