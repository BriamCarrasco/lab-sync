import { CanMatchFn, Route, UrlSegment, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../service/AuthService';

/**
 * Guard para rutas del módulo de administración.
 *
 * Bloquea la carga del feature admin si el usuario no tiene rol ADMIN.
 * Redirige al login si no está autenticado y a la página principal si no tiene el rol adecuado.
 *
 * @guard
 * @param route Ruta activada.
 * @param segments Segmentos de la URL.
 * @returns true si el acceso está permitido, o una UrlTree para redirección.
 */
export const adminRoleCanMatch: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }
  if (!auth.hasRole('ADMIN')) {
    return router.createUrlTree(['/home']);
  }
  return true;
};
