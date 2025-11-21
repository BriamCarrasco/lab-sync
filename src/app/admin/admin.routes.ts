import { Routes } from '@angular/router';
import { adminRoleCanMatch } from './core/admin-role.guard';
import { AdminLayoutComponent } from './layout/admin-layout.component';

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
    ],
  },
];
