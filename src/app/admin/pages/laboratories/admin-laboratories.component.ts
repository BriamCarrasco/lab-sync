import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { LaboratoriesService, Laboratory } from '../../service/laboratories';

@Component({
  selector: 'app-admin-laboratories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-laboratories.component.html',
  styleUrls: ['./admin-laboratories.component.css'],
})
export class AdminLaboratoriesComponent implements OnInit {
  laboratories: Laboratory[] = [];
  loading = false;
  errorMsg = '';
  editLab: Laboratory | null = null;
  saving = false;
  deletingId: number | null = null;

  createForm: FormGroup;
  searchTerm = signal<string>('');

  constructor(private readonly fb: FormBuilder, private readonly labsService: LaboratoriesService) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      specialty: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    this.loadLabs();
  }

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

  startEdit(lab: Laboratory) {
    this.editLab = { ...lab };
  }

  cancelEdit() {
    this.editLab = null;
  }

  saveEdit() {
    if (!this.editLab) return;
    this.saving = true;
    this.labsService.update(this.editLab.id, this.editLab).subscribe({
      next: (updated) => {
        this.laboratories = this.laboratories.map((l) => (l.id === updated.id ? updated : l));
        this.editLab = null;
        this.saving = false;
      },
      error: (err) => {
        this.errorMsg = typeof err?.error === 'string' ? err.error : 'Error al actualizar';
        this.saving = false;
      },
    });
  }

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
      },
      error: (err) => {
        this.errorMsg = typeof err?.error === 'string' ? err.error : 'Error al crear laboratorio';
        this.saving = false;
      },
    });
  }

  deleteLab(id: number) {
    if (!confirm('¿Eliminar laboratorio?')) return;
    this.deletingId = id;
    this.labsService.delete(id).subscribe({
      next: () => {
        this.laboratories = this.laboratories.filter((l) => l.id !== id);
        this.deletingId = null;
      },
      error: () => {
        this.errorMsg = 'Error al eliminar laboratorio';
        this.deletingId = null;
      },
    });
  }

  trackById(index: number, item: Laboratory) {
    return item.id;
  }
}
