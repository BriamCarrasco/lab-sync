import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../service/users';
import { LaboratoriesService } from '../../service/laboratories';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * Componente de inicio del módulo de administración.
 *
 * Muestra el resumen de usuarios y laboratorios registrados.
 * Realiza la carga de datos al inicializar el componente.
 *
 * @component
 */
@Component({
  selector: 'app-admin-home',
  standalone: true,
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css'],
  imports: [CommonModule, RouterModule],
})
export class AdminHomeComponent implements OnInit {
  /** Total de usuarios registrados */
  totalUsers = 0;
  /** Total de laboratorios registrados */
  totalLaboratories = 0;
  /** Indica si está cargando datos */
  loading = false;

  /**
   * Constructor del componente.
   * @param usersService Servicio de usuarios.
   * @param laboratoriesService Servicio de laboratorios.
   */
  constructor(
    private readonly usersService: UsersService,
    private readonly laboratoriesService: LaboratoriesService
  ) {}

  /**
   * Inicializa el componente y carga los totales de usuarios y laboratorios.
   */
  ngOnInit() {
    this.loading = true;
    this.usersService.getAll().subscribe({
      next: (users) => {
        this.totalUsers = users.length;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
    this.laboratoriesService.getAll().subscribe({
      next: (labs) => {
        this.totalLaboratories = labs.length;
      },
    });
  }
}
