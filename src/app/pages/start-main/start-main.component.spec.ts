import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartMainComponent } from './start-main.component';
import {ActivatedRoute} from "@angular/router";
import {Datepicker} from "flowbite";
import {FormControl, Validators} from "@angular/forms";
import SpyInstance = jest.SpyInstance;

describe('StartMainComponent', () => {
  let component: StartMainComponent;
  let fixture: ComponentFixture<StartMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartMainComponent],
      providers: [ { provide: ActivatedRoute, useValue: {} }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize pickedDate in constructor', () => {
    expect((component as any).pickedDate).toBe(new Date().toLocaleDateString('en-US'));
  });

  it('should open datepicker and initialize it with options', () => {
    document.body.innerHTML = `<div class="datepicker" id="inline-datepicker"><div class="datepicker-cell">${new Date().getDate()}</div></div>`;
    const datepickerSpy: SpyInstance = jest.spyOn(Datepicker.prototype, 'init').mockImplementation(() => {});
    const datepickerElement: HTMLDivElement = document.getElementById('inline-datepicker') as HTMLDivElement;
    const cell: HTMLDivElement = document.querySelectorAll('.datepicker-cell')[0] as HTMLDivElement;

    component.openDatepicker();

    expect(datepickerSpy).toHaveBeenCalled();
    expect(datepickerElement.classList.contains('is-active')).toBe(true);
    expect(cell.classList.contains('dark:bg-primary-600')).toBe(true);
  });

  it('should call setTrainStationDate when datepicker input is clicked', () => {
    const setTrainStationDateSpy: SpyInstance = jest.spyOn(component, 'setTrainStationDate');
    document.body.innerHTML = `<div class="datepicker" id="inline-datepicker"><div class="datepicker-cell">${new Date().getDate()}</div></div>`;

    component.openDatepicker();

    const datepickerInput = document.querySelector('.datepicker') as HTMLDivElement;
    datepickerInput.click();

    expect(setTrainStationDateSpy).toHaveBeenCalled();
  });

  it('should toggle route planning visibility', () => {
    (component as any).showRoutePlaning = false;
    component.toggleRoutePlaning();
    expect((component as any).showRoutePlaning).toBe(true);
    component.toggleRoutePlaning();
    expect((component as any).showRoutePlaning).toBe(false);
  });

  it('should set train station date', () => {
    const mockDate = '2023-10-10';
    (component as any).datepicker = { getDate: () => mockDate } as Datepicker;
    component.setTrainStationDate();
    expect((component as any).currentDate).toBe(new Date(mockDate).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }));
    expect((component as any).pickedDate).toBe(new Date(mockDate).toLocaleDateString('en-US'));
  });

  it("should not set train station date if datepicker is not initialized", () => {
    const org_currentDate = (component as any).currentDate;
    const org_pickedDate = (component as any).pickedDate;
    (component as any).datepicker = null;

    component.setTrainStationDate();
    expect((component as any).currentDate).toEqual(org_currentDate);
    expect((component as any).pickedDate).toEqual(org_pickedDate);

    (component as any).datepicker = {getDate: () => null} as unknown as Datepicker;
    component.setTrainStationDate();

    expect((component as any).currentDate).toEqual(org_currentDate);
    expect((component as any).pickedDate).toEqual(org_pickedDate);
  });

  it('should validate train station form', () => {
    component.trainStationForm = new FormControl('', Validators.required);
    component.getTrainstationData();
    expect((component as any).invalidTrainstation).toBe(true);

    component.trainStationForm.setValue('Valid Station');
    component.getTrainstationData();
    expect((component as any).invalidTrainstation).toBe(false);
  });
});
