import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/AuthService';
import { Toast } from '../../components/toast/toast';

/**
 * Componente de inicio de sesión.
 *
 * Permite al usuario autenticarse en la aplicación validando sus credenciales.
 * Muestra mensajes de éxito o error mediante un toast y redirige según el rol.
 *
 * @component
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, Toast],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  /**
   * Formulario reactivo de inicio de sesión.
   */
  loginForm: FormGroup;
  /**
   * Indica si el formulario fue enviado.
   */
  isSubmitted = false;
  /**
   * Indica si está en proceso de autenticación.
   */
  loading = false;
  /**
   * Mensaje de error de inicio de sesión.
   */
  loginError: string | null = null;

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
   * @param auth Servicio de autenticación.
   * @param router Servicio de navegación.
   */
  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  /** Getter para el campo usuario */
  get username() {
    return this.loginForm.get('username');
  }
  /** Getter para el campo contraseña */
  get password() {
    return this.loginForm.get('password');
  }

  /**
   * Muestra un mensaje en el toast.
   * @param msg Mensaje a mostrar.
   * @param type Tipo de toast.
   */
  showToastMsg(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMsg = msg;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }

  /**
   * Envía el formulario de inicio de sesión.
   * Valida los datos y realiza la petición al backend.
   * Muestra mensajes de éxito o error según la respuesta y redirige según el rol.
   */
  onSubmit() {
    this.isSubmitted = true;
    this.loginError = null;
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;
    this.loading = true;
    const { username, password } = this.loginForm.value;
    this.auth.login({ username, password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.showToastMsg('Inicio de sesión exitoso', 'success');
        const role = res.role?.toUpperCase();
        setTimeout(() => {
          if (role && role.replace(/^ROLE_/, '') === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/home']);
          }
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.showToastMsg('Credenciales inválidas.', 'error');
        } else {
          this.showToastMsg('Error al iniciar sesión. Intenta nuevamente.', 'error');
        }
      },
    });
  }
}
