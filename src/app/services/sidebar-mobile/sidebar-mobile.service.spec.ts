import { TestBed } from '@angular/core/testing';

import { SidebarMobileService } from './sidebar-mobile.service';

describe('SidebarService', () => {
  let service: SidebarMobileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SidebarMobileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should toggle mobile menu state', () => {
    service.isMobileMenuOpen = false;
    service.toggleMobileMenu();
    expect(service.isMobileMenuOpen).toBe(true);

    service.toggleMobileMenu();
    expect(service.isMobileMenuOpen).toBe(false);
  });

  it('should close mobile menu if it is open', () => {
    service.isMobileMenuOpen = true;
    service.closeMobileMenu();
    expect(service.isMobileMenuOpen).toBe(false);
  });

  it('should not change state if mobile menu is already closed', () => {
    service.isMobileMenuOpen = false;
    service.closeMobileMenu();
    expect(service.isMobileMenuOpen).toBe(false);
  });
});
