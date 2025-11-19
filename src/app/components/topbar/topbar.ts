import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  constructor(public router: Router) {}

  isLogin() {
    return this.router.url === '/login';
  }
  isRegister() {
    return this.router.url === '/register';
  }
  isHome() {
    return this.router.url === '/home' || this.router.url === '/landing';
  }
  isProfile() {
    return this.router.url === '/profile';
  }
}
