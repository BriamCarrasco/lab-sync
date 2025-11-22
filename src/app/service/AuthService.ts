import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

/**
 * Respuesta de autenticación.
 * @interface
 */
export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  id?: number;
}

/**
 * Solicitud de inicio de sesión.
 * @interface
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Solicitud de registro de usuario.
 * @interface
 */
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

/**
 * Usuario registrado.
 * @interface
 */
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

/**
 * Servicio para la autenticación y gestión de sesión de usuarios.
 *
 * Proporciona métodos para iniciar sesión, registrar usuarios, cerrar sesión,
 * y obtener información del usuario autenticado desde el almacenamiento local.
 *
 * @service
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /**
   * Cliente HTTP inyectado.
   */
  private readonly http = inject(HttpClient);
  /**
   * URL base para las peticiones de autenticación.
   */
  private readonly baseUrl = 'http://localhost:8081/auth';
  /**
   * Clave de almacenamiento para el token.
   */
  private readonly tokenKey = 'auth_token';
  /**
   * Clave de almacenamiento para el nombre de usuario.
   */
  private readonly userKey = 'auth_user';
  /**
   * Clave de almacenamiento para el rol.
   */
  private readonly roleKey = 'auth_role';
  /**
   * Clave de almacenamiento para el ID de usuario.
   */
  private readonly idKey = 'auth_user_id';

  /**
   * Inicia sesión y almacena los datos en localStorage.
   * @param data Datos de inicio de sesión.
   * @returns Observable con la respuesta de autenticación.
   */
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

  /**
   * Registra un nuevo usuario.
   * @param data Datos de registro.
   * @returns Observable con el usuario registrado.
   */
  register(data: RegisterRequest): Observable<RegisteredUser> {
    return this.http.post<RegisteredUser>(`${this.baseUrl}/register`, data);
  }

  /**
   * Cierra la sesión y elimina los datos del almacenamiento local.
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.idKey);
  }

  /**
   * Obtiene el token de autenticación.
   * @returns Token o null si no existe.
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Obtiene el nombre de usuario autenticado.
   * @returns Nombre de usuario o null si no existe.
   */
  getUsername(): string | null {
    return localStorage.getItem(this.userKey);
  }

  /**
   * Obtiene el rol del usuario autenticado.
   * @returns Rol o null si no existe.
   */
  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  /**
   * Obtiene el ID del usuario autenticado.
   * @returns ID de usuario o null si no existe.
   */
  getUserId(): number | null {
    const raw = localStorage.getItem(this.idKey);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isNaN(n) ? null : n;
  }

  /**
   * Verifica si el usuario tiene el rol esperado.
   * @param expected Rol esperado.
   * @returns true si el usuario tiene el rol, false en caso contrario.
   */
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

  /**
   * Verifica si el usuario está autenticado.
   * @returns true si está autenticado, false en caso contrario.
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
