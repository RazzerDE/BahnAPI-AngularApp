import {Component, HostListener} from '@angular/core';
import {NgClass, NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";
import {PageItemComponent} from "../util/page-item/page-item.component";
import {SidebarMobileService} from "../services/sidebar-mobile/sidebar-mobile.service";

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
  constructor(protected sidebarService: SidebarMobileService) {}

  /**
   * Listens for the 'Escape' key press event and closes the mobile menu if it is open.
   */
  @HostListener('document:keydown.escape')
  closeMobileMenu(): void {
    if (this.sidebarService.isMobileMenuOpen) {
      this.sidebarService.closeMobileMenu();
    }
  }
}
