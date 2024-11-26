import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';
import {ActivatedRoute} from "@angular/router";
import {SidebarMobileService} from "../services/sidebar-mobile/sidebar-mobile.service";
import {DataVerifierService} from "../services/data-verifier/data-verifier.service";

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let sidebarService: SidebarMobileService;
  let dataVerifier: DataVerifierService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: SidebarMobileService, useValue: { closeMobileMenu: jest.fn() } },
        { provide: DataVerifierService, useValue: { stations: [], elevators: [], current_station: undefined } }],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    dataVerifier = TestBed.inject(DataVerifierService);

    sidebarService = TestBed.inject(SidebarMobileService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close mobile menu if it is open when Escape key is pressed', () => {
    sidebarService.isMobileMenuOpen = true;
    jest.spyOn(sidebarService, 'closeMobileMenu');

    component.closeMobileMenu();
    expect(sidebarService.closeMobileMenu).toHaveBeenCalled();
  });

  it('should not close mobile menu if it is not open when Escape key is pressed', () => {
    sidebarService.isMobileMenuOpen = false;
    jest.spyOn(sidebarService, 'closeMobileMenu');

    component.closeMobileMenu();

    expect(sidebarService.closeMobileMenu).not.toHaveBeenCalled();
  });

  it('should clear cache correctly', () => {
    component.clearCache();

    expect(dataVerifier.stations).toEqual([]);
    expect(dataVerifier.elevators).toEqual([]);
    expect(dataVerifier.current_station).toBeUndefined();

    expect(localStorage.getItem('test')).toBeNull();
  });
});
