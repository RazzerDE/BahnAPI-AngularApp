import {Component, HostListener} from '@angular/core';
import {NgClass, NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";
import {PageItemComponent} from "../util/page-item/page-item.component";
import {SidebarMobileService} from "../services/sidebar-mobile/sidebar-mobile.service";
import {DataVerifierService} from "../services/data-verifier/data-verifier.service";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    NgOptimizedImage,
    RouterLink,
    NgClass,
    PageItemComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  constructor(protected sidebarService: SidebarMobileService, private dataVerifier: DataVerifierService) {
  }

  protected clearCache(): void {
    this.dataVerifier.stations = [];
    this.dataVerifier.elevators = [];
    this.dataVerifier.current_station = undefined;
    localStorage.clear();
  }

  /**
   * Hört auf das Drücken der 'Escape'-Taste und schließt das mobile Menü, wenn es geöffnet ist.
   */
  @HostListener('document:keydown.escape')
  closeMobileMenu(): void {
    if (this.sidebarService.isMobileMenuOpen) {
      this.sidebarService.closeMobileMenu();
    }
  }
}
