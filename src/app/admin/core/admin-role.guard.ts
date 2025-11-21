import { CanMatchFn, Route, UrlSegment, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../service/AuthService';

// Bloquea carga del feature admin si usuario no tiene rol ADMIN
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
