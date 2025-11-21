import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  id?: number; 
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  firstLastname: string;
  secondLastname: string;
  email: string;
  username: string;
  password: string;
  rut: string;
  role: string;
}

export interface RegisteredUser {
  id: number;
  name: string;
  firstLastname: string;
  secondLastname: string;
  email: string;
  username: string;
  rut: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8081/auth';
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';
  private readonly roleKey = 'auth_role';
  private readonly idKey = 'auth_user_id';

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, data).pipe(
      tap((res) => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, res.username);
        localStorage.setItem(this.roleKey, res.role);
        if (typeof res.id === 'number') {
          localStorage.setItem(this.idKey, String(res.id));
        }
      })
    );
  }

  register(data: RegisterRequest): Observable<RegisteredUser> {
    return this.http.post<RegisteredUser>(`${this.baseUrl}/register`, data);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.idKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.userKey);
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  getUserId(): number | null {
    const raw = localStorage.getItem(this.idKey);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isNaN(n) ? null : n;
  }

  hasRole(expected: string): boolean {
    const raw = this.getRole();
    if (!raw) return false;
    const normalize = (r: string) =>
      r
        .trim()
        .toUpperCase()
        .replace(/^ROLE_/, '');
    return normalize(raw) === normalize(expected);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
