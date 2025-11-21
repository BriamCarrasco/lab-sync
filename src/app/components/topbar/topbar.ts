import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/AuthService';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, RouterModule],
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

  get role() {
    return this.auth.getRole();
  }

  isAdmin() {
    const r = this.role?.trim().toUpperCase();
    return r === 'ADMIN' || r === 'ROLE_ADMIN';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/landing']);
  }
}
