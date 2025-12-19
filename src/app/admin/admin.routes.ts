import { Routes } from '@angular/router';
import { adminRoleCanMatch } from './core/admin-role.guard';
import { AdminLayoutComponent } from './layout/admin-layout.component';

/**
 * Rutas del módulo de administración.
 *
 * Define las rutas protegidas por el guard de rol de administrador y los componentes
 * que se cargan para cada sección administrativa: inicio, usuarios y laboratorios.
 *
 * @constant
 * @type {Routes}
 */
export const adminRoutes: Routes = [
  {
    path: '',
    canMatch: [adminRoleCanMatch],
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/admin-home.component').then((m) => m.AdminHomeComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users/admin-users.component').then((m) => m.AdminUsersComponent),
      },
      {
        path: 'laboratories',
        loadComponent: () =>
          import('./pages/laboratories/admin-laboratories.component').then(
            (m) => m.AdminLaboratoriesComponent
          ),
      },
      {
        path: 'analysis',
        loadComponent: () =>
          import('./pages/analysis/admin-analysis.component').then((m) => m.AdminAnalysisComponent),
      },
    ],
  },
];
