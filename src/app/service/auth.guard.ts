import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './AuthService';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const requiredRoles = route.data?.['roles'] as string[] | undefined;
  if (requiredRoles && requiredRoles.length > 0) {
    const rawRole = auth.getRole() ?? undefined;
    const normalize = (r: string | undefined | null) =>
      r
        ? r
            .trim()
            .toUpperCase()
            .replace(/^ROLE_/, '')
        : undefined;
    const userRole = normalize(rawRole);
    const normalizedRequired = requiredRoles.map((r) => normalize(r)!).filter(Boolean);
    const hasRole = !!userRole && normalizedRequired.includes(userRole);
    if (!hasRole) {
      console.warn('[authGuard] Acceso denegado.', {
        usuarioRolRaw: rawRole,
        usuarioRol: userRole,
        requeridos: normalizedRequired,
      });
      return router.createUrlTree(['/home']);
    }
    console.debug('[authGuard] Acceso permitido', { usuarioRol: userRole });
  }
  return true;
};
