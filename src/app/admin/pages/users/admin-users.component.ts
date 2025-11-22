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
import { Toast } from '../../../components/toast/toast';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Toast],
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
  toastMsg: string = '';
  showToast: boolean = false;
  toastType: 'success' | 'error' = 'success';

  createForm: FormGroup;

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
      role: [''],
    });
  }

  showSuccess(msg: string) {
    this.toastMsg = msg;
    this.showToast = true;
    this.toastType = 'success';
    setTimeout(() => (this.showToast = false), 3000);
  }

  showError(msg: string) {
    this.toastMsg = msg;
    this.toastType = 'error';
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
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
        this.showError(this.errorMsg);
      },
    });
  }

  filteredUsers(): User[] {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.users;
    return this.users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term)
    );
  }

  startEdit(user: User) {
    this.editUser = { ...user };
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
        this.showSuccess('Usuario actualizado correctamente');
      },
      error: () => {
        this.saving = false;
        this.showError('Error al actualizar usuario');
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
        this.showSuccess('Usuario creado correctamente');
      },
      error: () => {
        this.saving = false;
        this.showError('Error al crear usuario');
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
        this.showSuccess('Usuario eliminado correctamente');
      },
      error: () => {
        this.errorMsg = 'Error al eliminar usuario';
        this.deletingId = null;
        this.showError(this.errorMsg);
      },
    });
  }

  trackById(index: number, item: User) {
    return item.id;
  }
}
