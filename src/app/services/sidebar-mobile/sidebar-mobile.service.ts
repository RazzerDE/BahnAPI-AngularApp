import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarMobileService {
  isMobileMenuOpen: boolean = false;

  constructor() {
  }

  /**
   * Schaltet den Zustand des mobilen Menüs um.
   * Wenn das Menü derzeit geöffnet ist, wird es geschlossen.
   * Wenn das Menü derzeit geschlossen ist, wird es geöffnet.
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen
  }

  /**
   * Schließt das mobile Menü.
   * Setzt den Zustand des mobilen Menüs auf geschlossen.
   */
  closeMobileMenu(): void {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false
    }
  }
}
