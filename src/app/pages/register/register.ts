import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from '../../service/AuthService';
import { Toast } from '../../components/toast/toast';

/**
 * Validador de complejidad de contraseña.
 *
 * Verifica que la contraseña tenga al menos 8 caracteres, un número,
 * una letra mayúscula, una minúscula y un carácter especial.
 *
 * @returns ValidatorFn
 */
function passwordComplexityValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value) return null;

    const minLength = value.length >= 8;
    const hasNumber = /\d/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/]/.test(value);

    if (minLength && hasNumber && hasUpper && hasLower && hasSpecial) {
      return null;
    }
    return {
      passwordComplexity: true,
    };
  };
}

/**
 * Componente de registro de usuario.
 *
 * Permite al usuario crear una cuenta nueva validando los datos y mostrando mensajes
 * de éxito o error mediante un toast. El formulario se divide en dos pasos.
 *
 * @component
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, Toast],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  /**
   * Formulario reactivo de registro.
   */
  registerForm: FormGroup;
  /**
   * Indica si el formulario fue enviado.
   */
  isSubmitted = false;
  /**
   * Paso actual del formulario.
   */
  step = 1;
  /**
   * Indica si está en proceso de registro.
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
   * @param auth Servicio de autenticación.
   * @param router Servicio de navegación.
   */
  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      secondLastName: ['', Validators.required],
      rut: ['', [Validators.required, Validators.pattern(/^\d{7,8}-[\dkK]$/)]],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), passwordComplexityValidator()]],
    });
  }

  /** Getter para el campo nombre */
  get name() {
    return this.registerForm.get('name');
  }
  /** Getter para el campo primer apellido */
  get lastName() {
    return this.registerForm.get('lastName');
  }
  /** Getter para el campo segundo apellido */
  get secondLastName() {
    return this.registerForm.get('secondLastName');
  }
  /** Getter para el campo rut */
  get rut() {
    return this.registerForm.get('rut');
  }
  /** Getter para el campo usuario */
  get username() {
    return this.registerForm.get('username');
  }
  /** Getter para el campo email */
  get email() {
    return this.registerForm.get('email');
  }
  /** Getter para el campo contraseña */
  get password() {
    return this.registerForm.get('password');
  }

  /** Valor actual de la contraseña */
  get passwordValue(): string {
    return this.password?.value || '';
  }
  /** Valida longitud mínima de la contraseña */
  get passwordHasMinLength(): boolean {
    return this.passwordValue.length >= 8;
  }
  /** Valida si la contraseña tiene número */
  get passwordHasNumber(): boolean {
    return /\d/.test(this.passwordValue);
  }
  /** Valida si la contraseña tiene mayúscula */
  get passwordHasUpper(): boolean {
    return /[A-Z]/.test(this.passwordValue);
  }
  /** Valida si la contraseña tiene minúscula */
  get passwordHasLower(): boolean {
    return /[a-z]/.test(this.passwordValue);
  }
  /** Valida si la contraseña tiene carácter especial */
  get passwordHasSpecial(): boolean {
    return /[!@#$%^&*(),.?':{}|<>_\-+=~`[\]\\;/]/.test(this.passwordValue);
  }

  /**
   * Avanza al siguiente paso del formulario si los campos son válidos.
   */
  nextStep() {
    this.isSubmitted = true;
    if (this.name?.valid && this.lastName?.valid && this.secondLastName?.valid && this.rut?.valid) {
      this.step = 2;
      this.isSubmitted = false;
    }
  }

  /**
   * Regresa al paso anterior del formulario.
   */
  prevStep() {
    this.step = 1;
    this.isSubmitted = false;
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
   * Envía el formulario de registro.
   * Valida los datos y realiza la petición al backend.
   * Muestra mensajes de éxito o error según la respuesta.
   */
  onSubmit() {
    this.isSubmitted = true;
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;
    this.loading = true;

    const formValue = this.registerForm.value;
    const payload: RegisterRequest = {
      name: formValue.name,
      firstLastname: formValue.lastName,
      secondLastname: formValue.secondLastName,
      email: formValue.email,
      username: formValue.username,
      password: formValue.password,
      rut: formValue.rut,
      role: '',
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.showToastMsg('Registro exitoso. Serás redirigido al login.', 'success');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.showToastMsg('El nombre de usuario o correo ya está en uso.', 'error');
        } else {
          this.showToastMsg('Error al registrar. Intenta nuevamente.', 'error');
        }
      },
    });
  }
}
