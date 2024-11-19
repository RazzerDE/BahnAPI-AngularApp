import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageItemComponent } from './page-item.component';
import {ActivatedRoute} from "@angular/router";

describe('PageItemComponent', () => {
  let component: PageItemComponent;
  let fixture: ComponentFixture<PageItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageItemComponent],
      providers: [ { provide: ActivatedRoute, useValue: {} }]
    }).compileComponents();

    fixture = TestBed.createComponent(PageItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isLoaded to true after ngOnInit', (done) => {
    component.ngOnInit();
    setTimeout(() => {
      expect(component.isLoaded).toBe(true);
      done();
    }, 60); // Slightly longer than the delay in ngOnInit to ensure it has executed
  });
});
