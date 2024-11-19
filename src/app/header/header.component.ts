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

  ngOnInit(): void { this.applyTheme(); }

  /**
   * Retrieves the theme preference from local storage or the user's system settings.
   *
   * @returns {boolean} - `true` if the theme is dark, otherwise `false`.
   */
  private getThemeFromLocalStorage(): boolean {
    const darkMode = localStorage.getItem('dark');
    if (darkMode !== null) {
      return darkMode === 'true';
    }

    // check user's system theme
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  /**
   * Toggles the theme between light and dark mode.
   */
  toggleTheme(): void {
    this.isDark = !this.isDark;
    localStorage.setItem('dark', this.isDark.toString());
    this.applyTheme();
  }

  /**
   * Applies the current theme to the document
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
