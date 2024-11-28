import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from './types/environment';
import {StationDataResponse} from './types/station-data';
import {Stations} from "./types/stations";
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
    jest.spyOn(service, 'fetchStation').mockReturnValue(throwError('Error fetching station data'));

    service.getTimetableData('Invalid Station');

    expect(dataVerifier.current_station).toBeUndefined();
    done();
  });

  it('should handle error when fetching planned data', (done) => {
    const dummyStation = { station: { name: 'Station 1', eva: '123456' } } as unknown as Stations;

    jest.spyOn(service, 'fetchStation').mockReturnValue(of(dummyStation));
    jest.spyOn(service, 'fetchPlannedData').mockReturnValue(throwError('Error fetching planned data'));

    service.getTimetableData('Station 1', '241120', '21');

    expect(dataVerifier.current_station).toEqual(dummyStation.station);
    expect(localStorage.getItem('current_station')).toEqual(JSON.stringify(dummyStation.station));

    expect(dataVerifier.station_stops).toEqual(undefined);
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

    expect(dataVerifier.stations.length).toBe(2);
    expect(dataVerifier.stations).toEqual(dummyStations.result);
  });

  it('should handle invalid station start correctly', (done) => {
    jest.spyOn(service, 'fetchStation').mockReturnValue(of('Invalid Station'));
    jest.spyOn(dataVerifier, 'toggleErrorAlert').mockImplementation(() => {});

    service.getTimetableData('Invalid Station');

    expect(dataVerifier.station_stops).toBeUndefined();
    expect(dataVerifier.toggleErrorAlert).toHaveBeenCalledWith('invalid_station_start');
    done();
  });
});
