import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';
import {ApiService} from "../../services/api-service/api.service";
import {BehaviorSubject} from "rxjs";
import {ElementRef} from "@angular/core";
import {DataVerifierService} from "../../services/data-verifier/data-verifier.service";

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;
  let apiService: ApiService;
  let dataVerifier: DataVerifierService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent],
      providers: [{ provide: ApiService, DataVerifierService, useValue: { isInvalidKey: new BehaviorSubject<boolean>(false)} }]
    })
    .compileComponents();

    apiService = TestBed.inject(ApiService);
    dataVerifier = TestBed.inject(DataVerifierService);
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle invalid API key correctly', () => {
    const alertBox = document.createElement('div');
    alertBox.classList.add('hidden');
    component.alert_box = { nativeElement: alertBox } as ElementRef;

    jest.useFakeTimers();
    apiService.isInvalidKey.next(true);
    jest.advanceTimersByTime(50);

    expect(apiService.isLoading).toBe(false);
    expect(alertBox.classList.contains('hidden')).toBe(false);
    expect(dataVerifier.stations.length).toBe(0);
    expect(dataVerifier.elevators.length).toBe(0);
  });


});
