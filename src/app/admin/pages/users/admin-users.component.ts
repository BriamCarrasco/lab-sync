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

/**
 * Componente de administración de usuarios.
 *
 * Permite listar, buscar, crear, editar y eliminar usuarios en el módulo de administración.
 * Muestra mensajes de éxito o error mediante un toast.
 *
 * @component
 */
@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Toast],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css'],
})
export class AdminUsersComponent implements OnInit {
  /** Listado de usuarios */
  users: User[] = [];
  /** Indica si está cargando usuarios */
  loading = false;
  /** Mensaje de error */
  errorMsg = '';
  /** Usuario en edición */
  editUser: User | null = null;
  /** Indica si está guardando cambios */
  saving = false;
  /** ID del usuario en proceso de eliminación */
  deletingId: number | null = null;
  /** Mensaje a mostrar en el toast */
  toastMsg: string = '';
  /** Indica si el toast está visible */
  showToast: boolean = false;
  /** Tipo de toast ('success' | 'error') */
  toastType: 'success' | 'error' = 'success';

  /** Formulario reactivo para crear usuario */
  createForm: FormGroup;

  /** Término de búsqueda para filtrar usuarios */
  searchTerm = signal<string>('');

  /**
   * Constructor del componente.
   * @param fb FormBuilder para crear formularios.
   * @param usersService Servicio de usuarios.
   */
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
   * Inicializa el componente y carga los usuarios.
   */
  ngOnInit() {
    this.loadUsers();
  }

  /**
   * Carga el listado de usuarios desde el servicio.
   */
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

  /**
   * Filtra los usuarios según el término de búsqueda.
   * @returns Usuarios filtrados.
   */
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

  /**
   * Inicia la edición de un usuario.
   * @param user Usuario a editar.
   */
  startEdit(user: User) {
    this.editUser = { ...user };
  }

  /**
   * Cancela la edición de usuario.
   */
  cancelEdit() {
    this.editUser = null;
  }

  /**
   * Guarda los cambios del usuario editado.
   */
  saveEdit() {
    if (!this.editUser) return;
    this.saving = true;
    this.usersService.update(this.editUser).subscribe({
      next: (updated) => {
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

  /**
   * Crea un nuevo usuario.
   */
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

  /**
   * Elimina un usuario por su ID.
   * @param id Identificador del usuario.
   */
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

  /**
   * Función de seguimiento para ngFor por ID.
   * @param index Índice.
   * @param item Usuario.
   * @returns ID del usuario.
   */
  trackById(index: number, item: User) {
    return item.id;
  }
}
