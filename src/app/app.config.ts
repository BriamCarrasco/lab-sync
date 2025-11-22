import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './service/auth.interceptor';

import { routes } from './app.routes';

/**
 * Configuración principal de la aplicación Angular.
 *
 * Define los proveedores globales, rutas, animaciones, notificaciones,
 * interceptores HTTP y manejo de errores para la aplicación.
 *
 * @constant
 * @type {ApplicationConfig}
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      timeOut: 3000,
    }),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
