import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';
import {ApiService} from "../../services/api-service/api.service";
import {BehaviorSubject} from "rxjs";
import {ElementRef} from "@angular/core";

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;
  let apiService: ApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent],
      providers: [{ provide: ApiService, useValue: { isInvalidKey: new BehaviorSubject<boolean>(false)} }]
    })
    .compileComponents();

    apiService = TestBed.inject(ApiService);
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

    apiService.isInvalidKey.next(true);

    expect(apiService.isLoading).toBe(false);
    expect(alertBox.classList.contains('hidden')).toBe(false);
    expect(apiService.stations.length).toBe(0);
    expect(apiService.elevators.length).toBe(0);
  });


});
