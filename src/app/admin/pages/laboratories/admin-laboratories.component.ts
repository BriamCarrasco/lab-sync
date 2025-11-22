import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { LaboratoriesService, Laboratory } from '../../service/laboratories';
import { Toast } from '../../../components/toast/toast';

/**
 * Componente de administración de laboratorios.
 *
 * Permite listar, buscar, crear, editar y eliminar laboratorios en el módulo de administración.
 * Muestra mensajes de éxito o error mediante un toast.
 *
 * @component
 */
@Component({
  selector: 'app-admin-laboratories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Toast],
  templateUrl: './admin-laboratories.component.html',
  styleUrls: ['./admin-laboratories.component.css'],
})
export class AdminLaboratoriesComponent implements OnInit {
  /** Listado de laboratorios */
  laboratories: Laboratory[] = [];
  /** Indica si está cargando laboratorios */
  loading = false;
  /** Mensaje de error */
  errorMsg = '';
  /** Laboratorio en edición */
  editLab: Laboratory | null = null;
  /** Indica si está guardando cambios */
  saving = false;
  /** ID del laboratorio en proceso de eliminación */
  deletingId: number | null = null;
  /** Mensaje a mostrar en el toast */
  toastMsg: string = '';
  /** Indica si el toast está visible */
  showToast: boolean = false;
  /** Tipo de toast ('success' | 'error') */
  toastType: 'success' | 'error' = 'success';

  /** Formulario reactivo para crear laboratorio */
  createForm: FormGroup;
  /** Término de búsqueda para filtrar laboratorios */
  searchTerm = signal<string>('');

  /**
   * Constructor del componente.
   * @param fb FormBuilder para crear formularios.
   * @param labsService Servicio de laboratorios.
   */
  constructor(private readonly fb: FormBuilder, private readonly labsService: LaboratoriesService) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      specialty: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
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
   * Inicializa el componente y carga los laboratorios.
   */
  ngOnInit() {
    this.loadLabs();
  }

  /**
   * Carga el listado de laboratorios desde el servicio.
   */
  loadLabs() {
    this.loading = true;
    this.errorMsg = '';
    this.labsService.getAll().subscribe({
      next: (data) => {
        this.laboratories = data;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Error al cargar laboratorios';
        this.loading = false;
      },
    });
  }

  /**
   * Filtra los laboratorios según el término de búsqueda.
   * @returns Laboratorios filtrados.
   */
  filteredLabs(): Laboratory[] {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.laboratories;
    return this.laboratories.filter(
      (l) =>
        l.name.toLowerCase().includes(term) ||
        l.specialty.toLowerCase().includes(term) ||
        l.address.toLowerCase().includes(term)
    );
  }

  /**
   * Inicia la edición de un laboratorio.
   * @param lab Laboratorio a editar.
   */
  startEdit(lab: Laboratory) {
    this.editLab = { ...lab };
  }

  /**
   * Cancela la edición de laboratorio.
   */
  cancelEdit() {
    this.editLab = null;
  }

  /**
   * Guarda los cambios del laboratorio editado.
   */
  saveEdit() {
    if (!this.editLab) return;
    this.saving = true;
    this.labsService.update(this.editLab.id, this.editLab).subscribe({
      next: (updated) => {
        this.laboratories = this.laboratories.map((l) => (l.id === updated.id ? updated : l));
        this.editLab = null;
        this.saving = false;
        this.showSuccess('Laboratorio actualizado');
      },
      error: () => {
        this.saving = false;
        this.showError('Error al actualizar laboratorio');
      },
    });
  }

  /**
   * Crea un nuevo laboratorio.
   */
  createLab() {
    this.createForm.markAllAsTouched();
    if (this.createForm.invalid) return;
    this.saving = true;
    const formVal = this.createForm.value;
    this.labsService.create(formVal).subscribe({
      next: (newLab) => {
        this.laboratories = [newLab, ...this.laboratories];
        this.createForm.reset();
        this.saving = false;
        this.showSuccess('Laboratorio creado');
      },
      error: () => {
        this.saving = false;
        this.showError('Error al crear laboratorio');
      },
    });
  }

  /**
   * Elimina un laboratorio por su ID.
   * @param id Identificador del laboratorio.
   */
  deleteLab(id: number) {
    if (!confirm('¿Eliminar laboratorio?')) return;
    this.deletingId = id;
    this.labsService.delete(id).subscribe({
      next: () => {
        this.laboratories = this.laboratories.filter((l) => l.id !== id);
        this.deletingId = null;
        this.showSuccess('Laboratorio eliminado');
      },
      error: () => {
        this.deletingId = null;
        this.showError('Error al eliminar laboratorio');
      },
    });
  }

  /**
   * Función de seguimiento para ngFor por ID.
   * @param index Índice.
   * @param item Laboratorio.
   * @returns ID del laboratorio.
   */
  trackById(index: number, item: Laboratory) {
    return item.id;
  }
}
