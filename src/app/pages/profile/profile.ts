import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User } from '../../model/User';
import { UserService } from '../../service/UserService';
import { AuthService } from '../../service/AuthService';
import { Toast } from '../../components/toast/toast';

/**
 * Componente de perfil de usuario.
 *
 * Permite al usuario visualizar y editar sus datos personales.
 * Valida los datos y muestra mensajes de éxito o error mediante un toast.
 * Carga los datos del usuario autenticado y actualiza el perfil mediante el servicio.
 *
 * @component
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, Toast],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile implements OnInit {
  /**
   * Formulario reactivo de perfil.
   */
  profileForm: FormGroup;
  /**
   * Indica si el formulario fue enviado.
   */
  isSubmitted = false;
  /**
   * Indica si el usuario puede editar el perfil.
   */
  canEdit = true;
  /**
   * Usuario autenticado cargado.
   */
  user: User | null = null;
  /**
   * Indica si está en proceso de carga o actualización.
   */
  loading = false;

  /**
   * Mensaje a mostrar en el toast.
   */
  toastMsg: string = '';
  /**
   * Indica si el toast está visible.
   */
  showToast: boolean = false;
  /**
   * Tipo de toast ('success' | 'error').
   */
  toastType: 'success' | 'error' = 'success';

  /**
   * Constructor del componente.
   * @param fb FormBuilder para crear el formulario.
   * @param userService Servicio de usuario.
   * @param auth Servicio de autenticación.
   */
  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly auth: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      secondLastName: ['', Validators.required],
      userName: ['', Validators.required],
      rut: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
    });
  }

  /**
   * Inicializa el componente y carga los datos del usuario.
   */
  ngOnInit(): void {
    this.loadCurrentUser();
  }

  /**
   * Carga los datos del usuario autenticado.
   * Busca por ID o por nombre de usuario.
   */
  private async loadCurrentUser() {
    this.loading = true;
    try {
      const storedId = this.auth.getUserId?.();
      let apiUser: User | undefined;
      if (storedId) {
        apiUser = await firstValueFrom(this.userService.getById(storedId));
      }
      if (!apiUser) {
        let username = this.auth.getUsername();
        if (!username) {
          const token = this.auth.getToken();
          username = this.getUsernameFromToken(token);
        }
        if (!username) {
          this.showError('No se pudo identificar el usuario');
          return;
        }
        apiUser = await firstValueFrom(this.userService.getByUsername(username));
        if (!apiUser) {
          this.showError('Usuario no encontrado');
          return;
        }
      }
      this.user = apiUser;
      this.profileForm.patchValue({
        name: apiUser.name,
        lastName: apiUser.firstLastname,
        secondLastName: apiUser.secondLastname,
        userName: apiUser.username,
        rut: apiUser.rut,
        email: apiUser.email,
      });
    } catch {
      this.showError('Error al cargar usuario');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Extrae el nombre de usuario desde el token JWT.
   * @param token Token JWT.
   * @returns Nombre de usuario o null.
   */
  private getUsernameFromToken(token: string | null): string | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload) return null;
      if (typeof payload.sub === 'string' && payload.sub) return payload.sub;
      return null;
    } catch {
      return null;
    }
  }

  /** Getter para el campo nombre */
  get name() {
    return this.profileForm.get('name');
  }
  /** Getter para el campo primer apellido */
  get lastName() {
    return this.profileForm.get('lastName');
  }
  /** Getter para el campo segundo apellido */
  get secondLastName() {
    return this.profileForm.get('secondLastName');
  }
  /** Getter para el campo usuario */
  get userName() {
    return this.profileForm.get('userName');
  }
  /** Getter para el campo rut */
  get rut() {
    return this.profileForm.get('rut');
  }
  /** Getter para el campo email */
  get email() {
    return this.profileForm.get('email');
  }

  /**
   * Envía el formulario para actualizar el perfil.
   * Valida los datos y realiza la petición al backend.
   * Muestra mensajes de éxito o error según la respuesta.
   */
  async onSubmit() {
    this.isSubmitted = true;
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid || !this.user) return;
    this.loading = true;
    try {
      const raw = this.profileForm.getRawValue();
      const payload: Partial<User> = {
        id: this.user.id,
        name: raw.name,
        firstLastname: raw.lastName,
        secondLastname: raw.secondLastName,
        username: raw.userName,
        rut: this.user.rut,
        email: this.user.email,
        role: this.user.role ?? '',
      };
      const updated = await firstValueFrom(this.userService.update(this.user.id, payload));
      this.user = updated;
      this.profileForm.patchValue({
        name: updated.name,
        lastName: updated.firstLastname,
        secondLastName: updated.secondLastname,
        userName: updated.username,
      });
      this.showSuccess('Perfil actualizado correctamente');
    } catch (err: any) {
      this.showError(typeof err?.error === 'string' ? err.error : 'Error al actualizar perfil');
    } finally {
      this.loading = false;
    }
  }

  /**
   * Muestra un mensaje de éxito en el toast.
   * @param msg Mensaje a mostrar.
   */
  showSuccess(msg: string) {
    this.toastMsg = msg;
    this.toastType = 'success';
    this.showToast = true;
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
}
