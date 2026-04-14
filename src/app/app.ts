import { Component } from '@angular/core';
import {RouterOutlet, RouterLink, RouterModule} from '@angular/router';
import {AuthService} from './service/auth.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterModule,CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private readonly authService: AuthService) {}

  isLoggedIn(): boolean {
    return this.authService.estaLogueado();
  }

  logout() {
    this.authService.logout();
    location.href = '/login';
  }

  menuCerrado = false;

  toggleMenu() {
    this.menuCerrado = !this.menuCerrado;
  }

}
