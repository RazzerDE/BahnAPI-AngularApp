import { ComponentFixture, TestBed } from '@angular/core/testing';

import {ActivatedRoute} from "@angular/router";
import {AppComponent} from "./app.component";
import {HttpClient} from "@angular/common/http";
import * as flowbite from "flowbite";

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [ { provide: ActivatedRoute, useValue: {} }, { provide: HttpClient, useValue: {} } ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call initFlowbite', () => {
    jest.spyOn(flowbite, 'initFlowbite').mockImplementation(() => {});
    component.ngOnInit();
    expect(flowbite.initFlowbite).toHaveBeenCalled();
  });
});
