import {Component, OnInit} from '@angular/core';
import {SidebarMobileService} from "../services/sidebar-mobile/sidebar-mobile.service";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  isDark: boolean;

  constructor(protected sidebarService: SidebarMobileService) {
    this.isDark = this.getThemeFromLocalStorage();
  }

  ngOnInit(): void {
    this.applyTheme();
  }

  /**
   * Ruft die Theme-Einstellung aus dem lokalen Speicher oder den Systemeinstellungen des Benutzers ab.
   *
   * @returns {boolean} - `true`, wenn das Theme dunkel ist, andernfalls `false`.
   */
  private getThemeFromLocalStorage(): boolean {
    const darkMode = localStorage.getItem('dark');
    if (darkMode !== null) {
      return darkMode === 'true';
    }

    // überprüfe, ob der Benutzer das Betriebssystem-Theme verwendet
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  /**
   * Wechselt das Theme zwischen hellem und dunklem Modus.
   */
  toggleTheme(): void {
    this.isDark = !this.isDark;
    localStorage.setItem('dark', this.isDark.toString());
    this.applyTheme();
  }

  /**
   * Wendet das aktuelle Theme auf das Dokument an
   */
  private applyTheme(): void {
    const html: HTMLHtmlElement = document.querySelector('html') as HTMLHtmlElement;
    if (html) {
      if (this.isDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }
}
