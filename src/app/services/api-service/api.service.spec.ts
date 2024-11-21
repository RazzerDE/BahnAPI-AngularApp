import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from './types/environment';
import { StationDataResponse } from './types/station-data';
import {Timetable} from "./types/timetables";
import {Stations} from "./types/stations";
import {of, throwError} from "rxjs";

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch data from stations', () => {
    const dummyStations: StationDataResponse = {
      result: [
        { name: 'Station 1', hasWiFi: true, hasParking: true, hasSteplessAccess: true, number: 1, mailingAddress: { street: 'Street 1', city: 'City 1' } },
        { name: 'Station 2', hasWiFi: false, hasParking: false, hasSteplessAccess: false, number: 2, mailingAddress: { street: 'Street 2', city: 'City 2' } }
      ]
    } as unknown as StationDataResponse;

    service.getDataFromStations(2, 'sachsen-anhalt');
    const req = httpMock.expectOne(`${environment.API_URL}station-data/v2/stations?limit=2&federalstate=sachsen-anhalt`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyStations);

    expect(service.stations.length).toBe(2);
    expect(service.stations).toEqual(dummyStations.result);
  });

  it('should handle invalid API key correctly', () => {
    const alertBox = document.createElement('div');
    alertBox.classList.add('hidden');
    service.isInvalidKey.next(true);

    expect(service.isLoading).toBe(false);
  });

  it('should handle 401 error and set isInvalidKey to true', () => {
    service.getDataFromStations(2, 'sachsen-anhalt');
    const req = httpMock.expectOne(`${environment.API_URL}station-data/v2/stations?limit=2&federalstate=sachsen-anhalt`);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(service.isInvalidKey.value).toBe(true);
  });

  it('should convert XML to JSON correctly', async () => {
    const xmlString = `<root><child name="foo">bar</child></root>`;
    const expectedResult = { child: { name: 'foo', _: 'bar' } };

    const result = await service['xmlToJson'](xmlString);
    expect(result).toEqual(expectedResult);
  });

  it('should fail to convert XML to JSON correctly', async () => {
    const xmlString = `<root>child name"foo">bar</child></root>`;

    await expect(service['xmlToJson'](xmlString)).rejects.toThrow('Unexpected close tag\nLine: 0\nColumn: 33\nChar: >');
  });

  it('should update current_station from localStorage', () => {
    const dummyStation = { name: 'Station 1', hasWiFi: true, hasParking: true, hasSteplessAccess: true, number: 1, mailingAddress: { street: 'Street 1', city: 'City 1' } };
    localStorage.setItem('current_station', JSON.stringify(dummyStation));

    service['updateCache']();

    expect(service.current_station).toEqual(dummyStation);
  });

  it('should update stations from localStorage', () => {
    const dummyStations = [
      { name: 'Station 1', hasWiFi: true, hasParking: true, hasSteplessAccess: true, number: 1, mailingAddress: { street: 'Street 1', city: 'City 1' } },
      { name: 'Station 2', hasWiFi: false, hasParking: false, hasSteplessAccess: false, number: 2, mailingAddress: { street: 'Street 2', city: 'City 2' } }
    ];
    localStorage.setItem('stations', JSON.stringify(dummyStations));

    service['updateCache']();

    expect(service.stations).toEqual(dummyStations);
  });

  it('should update elevators from localStorage', () => {
    const dummyElevators = [
      { id: 1, description: 'Elevator 1', state: 'ACTIVE' },
      { id: 2, description: 'Elevator 2', state: 'INACTIVE' }
    ];
    localStorage.setItem('elevators', JSON.stringify(dummyElevators));

    service['updateCache']();

    expect(service.elevators).toEqual(dummyElevators);
  });

  it('should fetch timetables for a given station, date, and hour', (done) => {
    const dummyStation = { station: { name: 'Station 1', eva: '123456' } } as unknown as Stations;
    const dummyTimetable = { s: [{ stopName: 'Stop 1' }, { stopName: 'Stop 2' }] } as unknown as Timetable;

    spyOn(service, 'fetchStation').and.returnValue(of(dummyStation));
    spyOn(service, 'fetchPlannedData').and.returnValue(of(dummyTimetable));

    service.getTimetableData('Station 1', '241120', '21');

    expect(service.current_station).toEqual(dummyStation.station);
    expect(localStorage.getItem('current_station')).toEqual(JSON.stringify(dummyStation.station));
    expect(service.station_stops).toEqual(dummyTimetable.s);
    done();
  });

  it('should handle error when fetching station data', (done) => {
    spyOn(service, 'fetchStation').and.returnValue(throwError('Error fetching station data'));

    service.getTimetableData('Invalid Station');

    expect(service.current_station).toBeUndefined();
    done();
  });

  it('should handle error when fetching planned data', (done) => {
    const dummyStation = { station: { name: 'Station 1', eva: '123456' } } as unknown as Stations;

    spyOn(service, 'fetchStation').and.returnValue(of(dummyStation));
    spyOn(service, 'fetchPlannedData').and.returnValue(throwError('Error fetching planned data'));

    service.getTimetableData('Station 1', '241120', '21');

    expect(service.current_station).toEqual(dummyStation.station);
    expect(localStorage.getItem('current_station')).toEqual(JSON.stringify(dummyStation.station));
    expect(service.station_stops).toEqual([]);
    done();
  });

  it('should fetch data from stations with a limit and federal state filter', () => {
    const dummyStations: StationDataResponse = {
      result: [
        { name: 'Station 1', hasWiFi: true, hasParking: true, hasSteplessAccess: true, number: 1, mailingAddress: { street: 'Street 1', city: 'City 1' } },
        { name: 'Station 2', hasWiFi: false, hasParking: false, hasSteplessAccess: false, number: 2, mailingAddress: { street: 'Street 2', city: 'City 2' } }
      ]
    } as unknown as StationDataResponse;

    service.getDataFromStations(2, 'sachsen-anhalt');
    const req = httpMock.expectOne(`${environment.API_URL}station-data/v2/stations?limit=2&federalstate=sachsen-anhalt`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyStations);

    expect(service.stations.length).toBe(2);
    expect(service.stations).toEqual(dummyStations.result);
  });
});
