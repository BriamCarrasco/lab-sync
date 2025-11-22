import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/AuthService';

/**
 * Componente de barra superior (topbar).
 *
 * Muestra la barra de navegación principal, el nombre de usuario autenticado,
 * el rol y permite cerrar sesión. Adapta las opciones según el rol del usuario.
 *
 * @component
 */
@Component({
  selector: 'app-topbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  /**
   * Constructor del componente.
   * @param router Servicio de navegación.
   * @param auth Servicio de autenticación.
   */
  constructor(public router: Router, private readonly auth: AuthService) {}

  /**
   * Verifica si el usuario está autenticado.
   * @returns true si está autenticado, false en caso contrario.
   */
  isAuthenticated() {
    return this.auth.isAuthenticated();
  }

  /**
   * Obtiene el nombre de usuario autenticado.
   * @returns Nombre de usuario o null.
   */
  get username() {
    return this.auth.getUsername();
  }

  /**
   * Obtiene el rol del usuario autenticado.
   * @returns Rol o null.
   */
  get role() {
    return this.auth.getRole();
  }

  /**
   * Verifica si el usuario tiene rol de administrador.
   * @returns true si es administrador, false en caso contrario.
   */
  isAdmin() {
    const r = this.role?.trim().toUpperCase();
    return r === 'ADMIN' || r === 'ROLE_ADMIN';
  }

  /**
   * Cierra la sesión y redirige a la página de bienvenida.
   */
  logout() {
    this.auth.logout();
    this.router.navigate(['/landing']);
  }
}
