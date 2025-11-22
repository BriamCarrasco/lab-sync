import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor de autenticación para peticiones HTTP.
 *
 * Añade el token JWT en el encabezado Authorization de cada petición HTTP
 * si el usuario está autenticado. Permite que las peticiones al backend
 * incluyan la autenticación necesaria.
 *
 * @interceptor
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return next(req);
  }
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  return next(authReq);
};
