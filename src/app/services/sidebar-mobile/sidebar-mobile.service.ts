import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarMobileService {
  isMobileMenuOpen: boolean = false;

  constructor() {}

  /**
   * Toggles the state of the mobile menu.
   * If the menu is currently open, it will be closed.
   * If the menu is currently closed, it will be opened.
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen
  }

  /**
   * Closes the mobile menu.
   * Sets the state of the mobile menu to closed.
   */
  closeMobileMenu(): void {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false
    }
  }
}
