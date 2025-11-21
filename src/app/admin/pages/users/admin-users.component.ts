import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { UsersService, User } from '../../service/users';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css'],
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  errorMsg = '';
  editUser: User | null = null;
  saving = false;
  deletingId: number | null = null;

  // Formulario creación
  createForm: FormGroup;

  // Búsqueda simple
  searchTerm = signal<string>('');

  constructor(private readonly fb: FormBuilder, private readonly usersService: UsersService) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      firstLastname: ['', Validators.required],
      secondLastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(5)]],
      rut: ['', [Validators.required, Validators.pattern(/^\d{7,8}-[\dkK]$/)]],
      role: [''], // opcional
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.errorMsg = '';
    this.usersService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Error al cargar usuarios';
        this.loading = false;
      },
    });
  }

  // Filtrado simple (nombre o username)
  filteredUsers(): User[] {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.users;
    return this.users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }

  startEdit(user: User) {
    this.editUser = { ...user }; // copia para evitar mutación directa
  }

  cancelEdit() {
    this.editUser = null;
  }

  saveEdit() {
    if (!this.editUser) return;
    this.saving = true;
    this.usersService.update(this.editUser).subscribe({
      next: (updated) => {
        // Reemplaza en arreglo local
        this.users = this.users.map((u) => (u.id === updated.id ? updated : u));
        this.editUser = null;
        this.saving = false;
      },
      error: (err) => {
        this.errorMsg = typeof err?.error === 'string' ? err.error : 'Error al actualizar';
        this.saving = false;
      },
    });
  }

  createUser() {
    this.createForm.markAllAsTouched();
    if (this.createForm.invalid) return;
    this.saving = true;
    const formVal = this.createForm.value;
    this.usersService.create(formVal).subscribe({
      next: (newUser) => {
        this.users = [newUser, ...this.users];
        this.createForm.reset();
        this.saving = false;
      },
      error: (err) => {
        this.errorMsg = typeof err?.error === 'string' ? err.error : 'Error al crear usuario';
        this.saving = false;
      },
    });
  }

  deleteUser(id: number) {
    if (!confirm('¿Eliminar usuario?')) return;
    this.deletingId = id;
    this.usersService.delete(id).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u.id !== id);
        this.deletingId = null;
      },
      error: () => {
        this.errorMsg = 'Error al eliminar usuario';
        this.deletingId = null;
      },
    });
  }

  trackById(index: number, item: User) {
    return item.id;
  }
}
