import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HeaderComponent} from "./header/header.component";
import {SidebarComponent} from "./sidebar/sidebar.component";
import {initFlowbite} from "flowbite";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  ngOnInit(): void {
    initFlowbite();
  }

}
