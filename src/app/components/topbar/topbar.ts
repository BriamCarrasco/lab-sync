import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/AuthService';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  constructor(public router: Router, private readonly auth: AuthService) {}

  isAuthenticated() {
    return this.auth.isAuthenticated();
  }

  get username() {
    return this.auth.getUsername();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/landing']);
  }
}
