import { TestBed } from '@angular/core/testing';

import { DataVerifierService } from './data-verifier.service';
import {StationData} from "../api-service/types/station-data";
import {Elevator} from "../api-service/types/elevators";
import {Station} from "../api-service/types/stations";
import {Schedule, Timetable} from "../api-service/types/timetables";

describe('DataVerifierService', () => {
  let service: DataVerifierService;
  let localStorageMock: jest.SpyInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    localStorageMock = jest.spyOn(window.localStorage['__proto__'], 'getItem');
    service = TestBed.inject(DataVerifierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update cache with data from localStorage', () => {
    const mockStations = JSON.stringify([{id: 1, name: 'Station 1'} as unknown as StationData]);
    const mockElevators = JSON.stringify([{id: 1, name: 'Elevator 1'} as unknown as Elevator]);
    const mockCurrentStation = JSON.stringify({ id: 1, name: 'Current Station' });
    const mockStationNames = JSON.stringify(['Station 1', 'Station 2']);
    service.current_station = { eva: 1, name: 'Current Station' } as Station;

    localStorageMock.mockImplementation((key: string) => {
      switch (key) {
        case 'stations':
          return mockStations;
        case 'elevators':
          return mockElevators;
        case 'current_station':
          return mockCurrentStation;
        case 'station_names':
          return mockStationNames;
        default:
          return null;
      }
    });

    service.updateCache();

    expect(service.stations).toEqual(JSON.parse(mockStations));
    expect(service.elevators).toEqual(JSON.parse(mockElevators));
    expect(service.current_station).toEqual(JSON.parse(mockCurrentStation));
    expect(service.station_names).toEqual(JSON.parse(mockStationNames));
  });

  it('should convert XML to JSON correctly', async () => {
    const xmlString = `<root><item>value</item></root>`;
    const expectedResult = { item: 'value' };

    const result = await service.xmlToJson(xmlString);

    expect(result).toEqual(expectedResult);
  });

  it('should reject with an error for invalid XML', async () => {
    const invalidXmlString = `<root><item>value</item></root`;

    await expect(service.xmlToJson(invalidXmlString)).rejects.toThrow();
  });

  it('should remove current_station from localStorage if it is undefined', () => {
    localStorageMock.mockImplementation((key: string) => {
      if (key === 'current_station') {
        return JSON.stringify({ id: 1, name: 'Current Station' });
      }
      return null;
    });

    const removeItemMock = jest.spyOn(window.localStorage['__proto__'], 'removeItem');

    service.current_station = undefined;
    service.updateCache();

    expect(removeItemMock).toHaveBeenCalledWith('current_station');
    removeItemMock.mockRestore();
  });

  it('should handle empty localStorage values', () => {
    localStorageMock.mockImplementation(() => null);

    service.updateCache();

    expect(service.stations).toEqual([]);
    expect(service.elevators).toEqual([]);
    expect(service.current_station).toBeUndefined();
    expect(service.station_names).toEqual([]);
  });

  it('should filter direct routes correctly', () => {
    const timetable: Timetable = {
      station: "Station A",
      s: [
        { dp: { ppth: 'Station A|Station B|Station C' }, ar: { ppth: 'Station C|Station B|Station A' } } as Schedule,
        { dp: { ppth: 'Station A|Station D|Station E' }, ar: { ppth: 'Station E|Station D|Station A' } } as Schedule,
      ]
    };

    const result = service.filterDirectRoutes(timetable, 'Station B');
    expect(result.length).toBe(1);
    expect(result[0].dp?.ppth).toBe('Station A|Station B|Station C');
  });

  it('should normalize station names correctly', () => {
    const stationName = 'Station-Name With Spaces';
    const normalized = service.normalizeStationName(stationName);
    expect(normalized).toBe('stationnamewithspaces');
  });

  it('should return false if no path is found in schedule', () => {
    const timetable: Timetable = {
      station: "Station A",
      s: [
        { dp: { ppth: 'Station A|Station B|Station C' }, ar: {} } as Schedule,
        { dp: {}, ar: { ppth: 'Station C|Station B|Station A' } } as Schedule,
      ]
    };

    const result = service.filterDirectRoutes(timetable, 'Station D');
    expect(result.length).toBe(0);
  });

  it('should filter direct routes correctly using arrival path', () => {
    const timetable: Timetable = {
      station: "Station A",
      s: [
        { dp: { ppth: 'Station A|Station B|Station C' }, ar: { ppth: 'Station C|Station B|Station A' } } as Schedule,
        { dp: { ppth: 'Station A|Station D|Station E' }, ar: { ppth: 'Station E|Station D|Station A' } } as Schedule,
      ]
    };

    const result = service.filterDirectRoutes(timetable, 'Station B', true);
    expect(result.length).toBe(1);
    expect(result[0].ar?.ppth).toBe('Station C|Station B|Station A');
  });

  it('should return if alert_box was not found', () => {
    service.toggleErrorAlert();
  });

  it('should hide the alert box if no error type is provided', () => {
    document.body.innerHTML = `
      <div id="invalidAlert" class="hidden"></div>
      <h1 id="alert_title"></h1>
      <span id="alert_info"></span>
    `;
    const alertBox = document.getElementById('invalidAlert') as HTMLDivElement;

    service.toggleErrorAlert();

    expect(alertBox.classList.contains('hidden')).toBe(true);
  });

  it('should not show the alert box if it is already visible', () => {
    document.body.innerHTML = `
      <div id="invalidAlert"></div>
      <h1 id="alert_title"></h1>
      <span id="alert_info"></span>
    `;
    const alertBox = document.getElementById('invalidAlert') as HTMLDivElement;

    service.toggleErrorAlert('same_station');

    expect(alertBox.classList.contains('hidden')).toBe(false);
  });

  it('should show the alert box with "Invalid Stations" message for same_station error', () => {
    document.body.innerHTML = `
      <div id="invalidAlert" class="hidden"></div>
      <h1 id="alert_title"></h1>
      <span id="alert_info"></span>
    `;
    const alertBox = document.getElementById('invalidAlert') as HTMLDivElement;
    const alertTitle = document.getElementById('alert_title') as HTMLHeadingElement;
    const alertInfo = document.getElementById('alert_info') as HTMLSpanElement;

    service.toggleErrorAlert('same_station');

    expect(alertBox.classList.contains('hidden')).toBe(false);
    expect(alertTitle.innerText).toBe('Invalid Stations');
    expect(alertInfo.innerText).toBe('The start station cannot be the same as the destination station.');
  });

  it('should show the alert box with "No Trains Found" message for no_stations error', () => {
    document.body.innerHTML = `
      <div id="invalidAlert" class="hidden"></div>
      <h1 id="alert_title"></h1>
      <span id="alert_info"></span>
    `;
    const alertBox = document.getElementById('invalidAlert') as HTMLDivElement;
    const alertTitle = document.getElementById('alert_title') as HTMLHeadingElement;
    const alertInfo = document.getElementById('alert_info') as HTMLSpanElement;

    service.toggleErrorAlert('no_stations');

    expect(alertBox.classList.contains('hidden')).toBe(false);
    expect(alertTitle.innerText).toBe('No Trains Found');
    expect(alertInfo.innerText).toBe('No trains were found for the specified direct connection.');
  });

  it('should show the alert box with "Invalid Start Station" message for invalid_station_start error', () => {
    document.body.innerHTML = `
      <div id="invalidAlert" class="hidden"></div>
      <h1 id="alert_title"></h1>
      <span id="alert_info"></span>
    `;
    const alertBox = document.getElementById('invalidAlert') as HTMLDivElement;
    service.toggleErrorAlert('invalid_station_start');

    expect(alertBox.classList.contains('hidden')).toBe(false);
  });

  it('should show the alert box with "Invalid End Station" message for invalid_station_end error', () => {
    document.body.innerHTML = `
      <div id="invalidAlert" class="hidden"></div>
      <h1 id="alert_title"></h1>
      <span id="alert_info"></span>
    `;
    const alertBox = document.getElementById('invalidAlert') as HTMLDivElement;

    service.toggleErrorAlert('invalid_station_end');

    expect(alertBox.classList.contains('hidden')).toBe(false);
  });

  it('should format time string to "HH:MM" format', () => {
    const timeString = '2310151230';
    const formattedTime = service.formatTime(timeString);
    expect(formattedTime).toBe('12:30');
  });

  it('should show the auto-completion menu if there are cached station names and input value is not empty', () => {
    service.toggleAutoCompletionMenu(undefined as any);
  });

  it('should show the auto-completion menu if there are cached station names and input value is not empty', () => {
    document.body.innerHTML = `<div id="autoCompletionMenu" class="hidden"></div>`;
    const input = document.createElement('input');
    input.value = 'Sta';
    service.station_names = ['Station A', 'Station B'];

    const autoCompletionMenu = document.getElementById('autoCompletionMenu') as HTMLDivElement;
    service.toggleAutoCompletionMenu(input);

    expect(autoCompletionMenu.classList.contains('hidden')).toBe(false);
    expect(service.filtered_station_names).toEqual(['Station A', 'Station B']);
  });

  it('should hide the auto-completion menu if there are no cached station names', () => {
    document.body.innerHTML = `<div id="autoCompletionMenu"></div>`;
    const input = document.createElement('input');
    input.value = 'Sta';
    service.station_names = [];

    const autoCompletionMenu = document.getElementById('autoCompletionMenu') as HTMLDivElement;
    service.toggleAutoCompletionMenu(input);

    expect(autoCompletionMenu.classList.contains('hidden')).toBe(true);
  });

  it('should hide the auto-completion menu if input value is empty', () => {
    document.body.innerHTML = `<div id="autoCompletionMenu"></div>`;
    const input = document.createElement('input');
    input.value = '';
    service.station_names = ['Station A', 'Station B'];

    const autoCompletionMenu = document.getElementById('autoCompletionMenu') as HTMLDivElement;
    service.toggleAutoCompletionMenu(input);

    expect(autoCompletionMenu.classList.contains('hidden')).toBe(true);
  });

  it('should hide the auto-completion menu if filtered station names are empty', () => {
    document.body.innerHTML = `<div id="autoCompletionMenu"></div>`;
    const input = document.createElement('input');
    input.value = 'XYZ';
    service.station_names = ['Station A', 'Station B'];

    const autoCompletionMenu = document.getElementById('autoCompletionMenu') as HTMLDivElement;
    service.toggleAutoCompletionMenu(input);

    expect(autoCompletionMenu.classList.contains('hidden')).toBe(true);
  });

  it('should hide the auto-completion menu if input value matches a cached station name', () => {
    document.body.innerHTML = `<div id="autoCompletionMenu"></div>`;
    const input = document.createElement('input');
    input.value = 'Station A';
    service.station_names = ['Station A', 'Station B'];

    const autoCompletionMenu = document.getElementById('autoCompletionMenu') as HTMLDivElement;
    service.toggleAutoCompletionMenu(input);

    expect(autoCompletionMenu.classList.contains('hidden')).toBe(true);
  });

  it('should add a single station name to the list if it does not already exist', () => {
    const station = 'Station A';
    service.station_names = ['Station B'];
    const setItemSpy = jest.spyOn(window.localStorage['__proto__'], 'setItem');

    service.updateStationList(station);

    expect(service.station_names).toContain(station);
    expect(setItemSpy).toHaveBeenCalledWith('station_names', JSON.stringify(['Station B', 'Station A']));
  });

  it('should not add a single station name to the list if it already exists', () => {
    const station = 'Station A';
    service.station_names = ['Station A'];
    const setItemSpy = jest.spyOn(window.localStorage['__proto__'], 'setItem');

    service.updateStationList(station);

    expect(service.station_names).toEqual(['Station A']);
    expect(setItemSpy).toHaveBeenCalledWith('station_names', JSON.stringify(['Station A']));
  });

});
