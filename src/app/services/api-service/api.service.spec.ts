import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from './types/environment';
import {StationDataResponse} from './types/station-data';
import {Station, Stations} from "./types/stations";
import {of, throwError} from "rxjs";
import {DataVerifierService} from "../data-verifier/data-verifier.service";

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let dataVerifier: DataVerifierService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService, DataVerifierService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    dataVerifier = TestBed.inject(DataVerifierService);
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

    expect(dataVerifier.stations.length).toBe(2);
    expect(dataVerifier.stations).toEqual(dummyStations.result);
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

    const result = await dataVerifier['xmlToJson'](xmlString);
    expect(result).toEqual(expectedResult);
  });

  it('should fail to convert XML to JSON correctly', async () => {
    const xmlString = `<root>child name"foo">bar</child></root>`;

    await expect(dataVerifier['xmlToJson'](xmlString)).rejects.toThrow('Unexpected close tag\nLine: 0\nColumn: 33\nChar: >');
  });

  it('should fetch timetables for a given station, date, and hour', (done) => {
    const dummyStation = { station: { name: 'Station 1', eva: '123456' } } as unknown as Stations;
    const dummyTimetable = { s: [{ stopName: 'Stop 1' }, { stopName: 'Stop 2' }] };

    jest.spyOn(service, 'fetchStation').mockReturnValue(of(dummyStation));
    jest.spyOn(service, 'fetchPlannedData').mockReturnValue(of(dummyTimetable));

    service.getTimetableData('Station 1', '241120', '21');

    expect(dataVerifier.current_station).toEqual(dummyStation.station);
    expect(localStorage.getItem('current_station')).toEqual(JSON.stringify(dummyStation.station));
    expect(dataVerifier.station_stops).toEqual(dummyTimetable);
    done();
  });

  it('should handle error when fetching station data', (done) => {
    jest.spyOn(service, 'fetchStation').mockReturnValue(throwError(() => 'Error fetching station data'));

    service.getTimetableData('Invalid Station');

    expect(dataVerifier.current_station).toBeUndefined();
    done();
  });

  it('should handle error when fetching planned data', (done) => {
    const dummyStation = { station: { name: 'Station 1', eva: '123456' } } as unknown as Stations;

    jest.spyOn(service, 'fetchStation').mockReturnValue(of(dummyStation));
    jest.spyOn(service, 'fetchPlannedData').mockReturnValue(throwError(() => 'Error fetching planned data'));

    service.getTimetableData('Station 1', '241120', '21');

    expect(dataVerifier.current_station).toEqual(dummyStation.station);
    expect(localStorage.getItem('current_station')).toEqual(JSON.stringify(dummyStation.station));

    expect(dataVerifier.station_stops).toEqual(undefined);
    done();
  });

  it('should handle invalid station start correctly', (done) => {
    jest.spyOn(service, 'fetchStation').mockReturnValue(of('Invalid Station'));
    jest.spyOn(dataVerifier, 'toggleErrorAlert').mockImplementation(() => {});

    service.getTimetableData('Invalid Station');

    expect(dataVerifier.station_stops).toBeUndefined();
    expect(dataVerifier.toggleErrorAlert).toHaveBeenCalledWith('invalid_station_start');
    done();
  });

  it('should set default date and hour if not provided', (done) => {
    const dummyStation = { station: { name: 'Station 1', eva: '123456' } } as unknown as Stations;
    const dummyTimetable = { s: [{ stopName: 'Stop 1' }, { stopName: 'Stop 2' }] };

    jest.spyOn(service, 'fetchStation').mockReturnValue(of(dummyStation));
    jest.spyOn(service, 'fetchPlannedData').mockReturnValue(of(dummyTimetable));

    service.getTimetableData('Station 1');

    const expectedDate = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const expectedHour = new Date().getHours().toString().padStart(2, '0');

    expect(dataVerifier.current_station).toEqual(dummyStation.station);
    expect(localStorage.getItem('current_station')).toEqual(JSON.stringify(dummyStation.station));
    expect(dataVerifier.station_stops).toEqual(dummyTimetable);
    expect(service['fetchPlannedData']).toHaveBeenCalledWith(dummyStation.station, expectedDate, expectedHour);
    done();
  });

  it('should fetch facilities with type ELEVATOR and state ACTIVE', () => {
    const dummyFacilities = [{ id: 1, type: 'ELEVATOR', state: 'ACTIVE' }];

    service.fetchFacilities().subscribe((facilities) => {
      expect(facilities).toEqual(dummyFacilities);
    });

    const req = httpMock.expectOne(`${environment.API_URL}fasta/v2/facilities?type=ELEVATOR&state=ACTIVE`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyFacilities);
  });

  it('should fetch station data and convert XML to JSON', (done) => {
    const xmlResponse = `<station><name>Station 1</name></station>`;
    const jsonResponse = { station: { name: 'Station 1' } };

    jest.spyOn(dataVerifier, 'xmlToJson').mockReturnValue(Promise.resolve(jsonResponse));

    service.fetchStation('Station 1').subscribe((data) => {
      expect(data).toEqual(jsonResponse);
      done();
    });

    const req = httpMock.expectOne(`${environment.API_URL}timetables/v1/station/Station 1`);
    expect(req.request.method).toBe('GET');
    req.flush(xmlResponse);
  });

  it('should fetch planned data and convert XML to JSON', (done) => {
    const dummyStation = {eva: '123456'} as unknown as Station;
    const xmlResponse = `<timetable><stop>Stop 1</stop></timetable>`;
    const jsonResponse = { timetable: { stop: 'Stop 1' } };

    jest.spyOn(dataVerifier, 'xmlToJson').mockReturnValue(Promise.resolve(jsonResponse));

    service.fetchPlannedData(dummyStation, '241120', '21').subscribe((data) => {
      expect(data).toEqual(jsonResponse);
      done();
    });

    const req = httpMock.expectOne(`${environment.API_URL}timetables/v1/plan/123456/241120/21`);
    expect(req.request.method).toBe('GET');
    req.flush(xmlResponse);
  });

  it('should set default limit and federalstate if not provided', () => {
    const dummyStations: StationDataResponse = {
      result: [
        { name: 'Station 1', hasWiFi: true, hasParking: true, hasSteplessAccess: true, number: 1, mailingAddress: { street: 'Street 1', city: 'City 1' } },
        { name: 'Station 2', hasWiFi: false, hasParking: false, hasSteplessAccess: false, number: 2, mailingAddress: { street: 'Street 2', city: 'City 2' } }
      ]
    } as unknown as StationDataResponse;

    service.getDataFromStations();
    const req = httpMock.expectOne(`${environment.API_URL}station-data/v2/stations?limit=12&federalstate=sachsen-anhalt`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyStations);

    expect(dataVerifier.stations.length).toBe(2);
    expect(dataVerifier.stations).toEqual(dummyStations.result);
  });

  it('should fetch stations with limit, federalstate, and search string', () => {
    const dummyStations = [{ name: 'Station 1' }, { name: 'Station 2' }];
    const limit = 10;
    const federalstate = 'sachsen-anhalt';
    const searched_string = 'search';

    service.fetchStations(limit, federalstate, searched_string).subscribe((stations) => {
      expect(stations).toEqual(dummyStations);
    });

    const req = httpMock.expectOne(`${environment.API_URL}station-data/v2/stations?limit=${limit}&federalstate=${federalstate}&searchstring=${searched_string}`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyStations);
  });

  it('should fetch data by station name and handle success response', () => {
    const dummyStations: StationDataResponse = {
      result: [
        { name: 'Station 1', hasWiFi: true, hasParking: true, hasSteplessAccess: true, number: 1, mailingAddress: { street: 'Street 1', city: 'City 1' } }
      ]
    } as unknown as StationDataResponse;

    jest.spyOn(service, 'fetchStations').mockReturnValue(of(dummyStations));
    jest.spyOn(dataVerifier, 'updateStationList').mockImplementation(() => {});

    service.getDataByStation('Station 1');

    expect(dataVerifier.stations).toEqual(dummyStations.result);
    expect(localStorage.getItem('stations')).toEqual(JSON.stringify(dummyStations.result));
    expect(dataVerifier.updateStationList).toHaveBeenCalledWith(dummyStations.result);
  });

  it('should handle 404 error when station is not found', () => {
    const errorResponse = { status: 404, statusText: 'Not Found' };
    const errorBox = document.createElement('span');
    errorBox.id = 'error_trainstation';
    errorBox.classList.add('hidden');
    document.body.appendChild(errorBox);

    jest.spyOn(service, 'fetchStations').mockReturnValue(throwError(() => errorResponse));

    service.getDataByStation('Invalid Station');

    expect(dataVerifier.stations).toEqual([]);
    expect(localStorage.getItem('stations')).toEqual(JSON.stringify([]));
    expect(errorBox.classList.contains('hidden')).toBe(false);
  });

  it('should handle 401 error and set isInvalidKey to true', () => {
    const errorResponse = { status: 401, statusText: 'Unauthorized' };

    jest.spyOn(service, 'fetchStations').mockReturnValue(throwError(() => errorResponse));

    service.getDataByStation('Station 1');

    expect(service.isInvalidKey.value).toBe(true);
  });

  it('should fetch elevator facilities and store them in localStorage', () => {
    const dummyElevators = [{ id: 1, type: 'ELEVATOR', state: 'ACTIVE' }];

    service.checkStationsForElevator();

    const req = httpMock.expectOne(`${environment.API_URL}fasta/v2/facilities?type=ELEVATOR&state=ACTIVE`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyElevators);

    expect(dataVerifier.elevators).toEqual(dummyElevators);
    expect(localStorage.getItem('elevators')).toEqual(JSON.stringify(dummyElevators));
  });

  it('should handle error when fetching elevator facilities', () => {
    const errorResponse = { status: 500, statusText: 'Server Error' };

    service.checkStationsForElevator();

    const req = httpMock.expectOne(`${environment.API_URL}fasta/v2/facilities?type=ELEVATOR&state=ACTIVE`);
    expect(req.request.method).toBe('GET');
    req.flush('Error fetching facilities', errorResponse);
  });
});
