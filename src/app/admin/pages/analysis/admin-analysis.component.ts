import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { AnalysisService } from '../../service/analysis';
import { Analysis, Result } from '../../../model/Analysis';
import { Toast } from '../../../components/toast/toast';
import { UsersService, User } from '../../service/users';
import { LaboratoriesService, Laboratory } from '../../service/laboratories';

/**
 * Componente de administración de análisis.
 *
 * Permite listar, buscar, crear, editar y eliminar análisis en el módulo de administración.
 * También permite visualizar los resultados asociados a cada análisis.
 * Muestra mensajes de éxito o error mediante un toast.
 *
 * @component
 */
@Component({
  selector: 'app-admin-analysis',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Toast],
  templateUrl: './admin-analysis.component.html',
  styleUrls: ['./admin-analysis.component.css'],
})
export class AdminAnalysisComponent implements OnInit {
  /** Listado de análisis */
  analysisList: Analysis[] = [];
  /** Indica si está cargando análisis */
  loading = false;
  /** Mensaje de error */
  errorMsg = '';
  /** Análisis en edición */
  editAnalysis: Analysis | null = null;
  /** Indica si está guardando cambios */
  saving = false;
  /** ID del análisis en proceso de eliminación */
  deletingId: number | null = null;
  /** Mensaje a mostrar en el toast */
  toastMsg: string = '';
  /** Indica si el toast está visible */
  showToast: boolean = false;
  /** Tipo de toast ('success' | 'error') */
  toastType: 'success' | 'error' = 'success';

  /** Formulario reactivo para crear análisis */
  createForm: FormGroup;
  /** Término de búsqueda para filtrar análisis */
  searchTerm = signal<string>('');

  /** ID del análisis seleccionado para ver resultados */
  selectedAnalysisId: number | null = null;
  /** Resultados del análisis seleccionado */
  selectedResults: Result[] = [];
  /** Indica si está cargando resultados */
  loadingResults = false;

  /** Listado de usuarios */
  users: User[] = [];
  /** Listado de laboratorios */
  laboratories: Laboratory[] = [];

  /**
   * Constructor del componente.
   * @param fb FormBuilder para crear formularios.
   * @param analysisService Servicio de análisis.
   * @param usersService Servicio de usuarios.
   * @param laboratoriesService Servicio de laboratorios.
   */
  constructor(
    private readonly fb: FormBuilder,
    private readonly analysisService: AnalysisService,
    private readonly usersService: UsersService,
    private readonly laboratoriesService: LaboratoriesService
  ) {
    this.createForm = this.fb.group({
      laboratoryId: ['', [Validators.required, Validators.min(1)]],
      userId: ['', [Validators.required, Validators.min(1)]],
      status: ['PENDIENTE', Validators.required],
    });
  }

  /**
   * Muestra un mensaje de éxito en el toast.
   * @param msg Mensaje a mostrar.
   */
  showSuccess(msg: string) {
    this.toastMsg = msg;
    this.showToast = true;
    this.toastType = 'success';
    setTimeout(() => (this.showToast = false), 3000);
  }

  /**
   * Muestra un mensaje de error en el toast.
   * @param msg Mensaje a mostrar.
   */
  showError(msg: string) {
    this.toastMsg = msg;
    this.toastType = 'error';
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }

  /**
   * Inicializa el componente y carga los análisis.
   */
  ngOnInit() {
    this.loadAnalysis();
    this.loadUsers();
    this.loadLaboratories();
  }

  /**
   * Carga el listado de análisis desde el servicio.
   */
  loadAnalysis() {
    this.loading = true;
    this.errorMsg = '';
    this.analysisService.getAll().subscribe({
      next: (data) => {
        this.analysisList = data;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Error al cargar análisis';
        this.loading = false;
      },
    });
  }

  /**
   * Filtra los análisis según el término de búsqueda.
   * @returns Análisis filtrados.
   */
  filteredAnalysis(): Analysis[] {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.analysisList;
    return this.analysisList.filter(
      (a) =>
        a.status.toLowerCase().includes(term) ||
        this.getUserName(a.userId).toLowerCase().includes(term) ||
        this.getLaboratoryName(a.laboratoryId).toLowerCase().includes(term) ||
        a.id.toString().includes(term)
    );
  }

  /**
   * Inicia la edición de un análisis.
   * @param analysis Análisis a editar.
   */
  startEdit(analysis: Analysis) {
    this.editAnalysis = { ...analysis };
  }

  /**
   * Cancela la edición de análisis.
   */
  cancelEdit() {
    this.editAnalysis = null;
  }

  /**
   * Guarda los cambios del análisis editado.
   */
  saveEdit() {
    if (!this.editAnalysis) return;
    this.saving = true;
    this.analysisService.update(this.editAnalysis.id, this.editAnalysis).subscribe({
      next: (updated) => {
        this.analysisList = this.analysisList.map((a) => (a.id === updated.id ? updated : a));
        this.editAnalysis = null;
        this.saving = false;
        this.showSuccess('Análisis actualizado');
      },
      error: () => {
        this.saving = false;
        this.showError('Error al actualizar análisis');
      },
    });
  }

  /**
   * Crea un nuevo análisis.
   */
  createAnalysis() {
    this.createForm.markAllAsTouched();
    if (this.createForm.invalid) return;
    this.saving = true;
    const formVal = this.createForm.value;
    this.analysisService.create(formVal).subscribe({
      next: (newAnalysis) => {
        this.analysisList = [newAnalysis, ...this.analysisList];
        this.createForm.reset({ status: 'PENDIENTE' });
        this.saving = false;
        this.showSuccess('Análisis creado');
      },
      error: () => {
        this.saving = false;
        this.showError('Error al crear análisis');
      },
    });
  }

  /**
   * Elimina un análisis por su ID.
   * @param id Identificador del análisis.
   */
  deleteAnalysis(id: number) {
    if (!confirm('¿Eliminar análisis?')) return;
    this.deletingId = id;
    this.analysisService.delete(id).subscribe({
      next: () => {
        this.analysisList = this.analysisList.filter((a) => a.id !== id);
        this.deletingId = null;
        this.showSuccess('Análisis eliminado');
        // Si estaba viendo resultados de este análisis, cerrar
        if (this.selectedAnalysisId === id) {
          this.closeResults();
        }
      },
      error: () => {
        this.deletingId = null;
        this.showError('Error al eliminar análisis');
      },
    });
  }

  /**
   * Visualiza los resultados de un análisis.
   * @param analysis Análisis seleccionado.
   */
  viewResults(analysis: Analysis) {
    this.selectedAnalysisId = analysis.id;
    this.loadingResults = true;

    // Si el análisis ya tiene resultados en la respuesta, usarlos
    if (analysis.results && analysis.results.length > 0) {
      this.selectedResults = analysis.results;
      this.loadingResults = false;
    } else {
      // De lo contrario, consultar el endpoint de resultados
      this.analysisService.getResultsByAnalysisId(analysis.id).subscribe({
        next: (results) => {
          this.selectedResults = results;
          this.loadingResults = false;
        },
        error: () => {
          this.showError('Error al cargar resultados');
          this.loadingResults = false;
          this.closeResults();
        },
      });
    }
  }

  /**
   * Cierra la vista de resultados.
   */
  closeResults() {
    this.selectedAnalysisId = null;
    this.selectedResults = [];
  }

  /**
   * Carga el listado de usuarios desde el servicio.
   */
  loadUsers() {
    this.usersService.getAll().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: () => {
        this.showError('Error al cargar usuarios');
      },
    });
  }

  /**
   * Carga el listado de laboratorios desde el servicio.
   */
  loadLaboratories() {
    this.laboratoriesService.getAll().subscribe({
      next: (data) => {
        this.laboratories = data;
      },
      error: () => {
        this.showError('Error al cargar laboratorios');
      },
    });
  }

  /**
   * Obtiene el nombre de un usuario por su ID.
   * @param userId ID del usuario.
   * @returns Nombre del usuario o el ID si no se encuentra.
   */
  getUserName(userId: number): string {
    const user = this.users.find((u) => u.id === userId);
    return user ? `${user.name} ${user.firstLastname}` : `Usuario #${userId}`;
  }

  /**
   * Obtiene el nombre de un laboratorio por su ID.
   * @param labId ID del laboratorio.
   * @returns Nombre del laboratorio o el ID si no se encuentra.
   */
  getLaboratoryName(labId: number): string {
    const lab = this.laboratories.find((l) => l.id === labId);
    return lab ? lab.name : `Laboratorio #${labId}`;
  }

  /**
   * Función de seguimiento para ngFor por ID.
   * @param index Índice.
   * @param item Análisis.
   * @returns ID del análisis.
   */
  trackById(index: number, item: Analysis | Result) {
    return item.id;
  }
}
