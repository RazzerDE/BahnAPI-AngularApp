import {Component, Input, OnInit} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {NgClass} from "@angular/common";
import {SidebarMobileService} from "../../services/sidebar-mobile/sidebar-mobile.service";

@Component({
  selector: 'sidebar-page-item',
  standalone: true,
  imports: [
    RouterLink,
    NgClass
  ],
  templateUrl: './page-item.component.html',
  styleUrl: './page-item.component.css'
})
export class PageItemComponent implements OnInit {
  isLoaded: boolean = false;

  @Input() redirect_url: string = '';
  @Input() icon_path: string = '';
  @Input() site_name: string = '';

  constructor(protected router: Router, protected sidebarService: SidebarMobileService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoaded = true; // zeige eine animation für die seitenleiste
    }, 50); // Kleine Verzögerung um sicherzustellen das das DOM bereit ist
  }

}
