import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../service/UserService';
import { AuthService } from '../../service/AuthService';
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
    const hasSpecial = /[!@#$%^&*(),.?':{}|<>_\-+=~`[\]\\;/]/.test(value);

    if (minLength && hasNumber && hasUpper && hasLower && hasSpecial) {
      return null;
    }
    return {
      passwordComplexity: true,
    };
  };
}

/**
 * Componente para la recuperación y cambio de contraseña de usuario.
 *
 * Permite al usuario cambiar su contraseña validando los datos y mostrando mensajes
 * de éxito o error mediante un toast. Valida la complejidad y coincidencia de las contraseñas.
 *
 * @component
 */
@Component({
  selector: 'app-recoverypassword',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, Toast],
  templateUrl: './recoverypassword.html',
  styleUrl: './recoverypassword.css',
})
export class Recoverypassword {
  /**
   * Validador para verificar que las contraseñas nuevas coincidan.
   */
  passwordsMatch: ValidatorFn = (control: AbstractControl) => {
    const newPass = control.get('newPassword')?.value;
    const repeatPass = control.get('repeatPassword')?.value;
    return newPass === repeatPass ? null : { mismatch: true };
  };

  /**
   * Formulario reactivo para el cambio de contraseña.
   */
  passwordForm!: FormGroup<{
    currentPassword: FormControl<string>;
    newPassword: FormControl<string>;
    repeatPassword: FormControl<string>;
  }>;

  /**
   * Indica si el formulario fue enviado.
   */
  isSubmitted = false;
  /**
   * Mensaje de error.
   */
  errorMsg: string | null = null;
  /**
   * Mensaje de éxito.
   */
  successMsg: string | null = null;
  /**
   * Indica si está en proceso de cambio de contraseña.
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

  /** Valor actual de la nueva contraseña */
  get newPasswordValue(): string {
    return this.newPassword.value || '';
  }
  /** Valida longitud mínima de la nueva contraseña */
  get newPasswordHasMinLength(): boolean {
    return this.newPasswordValue.length >= 8;
  }
  /** Valida si la nueva contraseña tiene número */
  get newPasswordHasNumber(): boolean {
    return /\d/.test(this.newPasswordValue);
  }
  /** Valida si la nueva contraseña tiene mayúscula */
  get newPasswordHasUpper(): boolean {
    return /[A-Z]/.test(this.newPasswordValue);
  }
  /** Valida si la nueva contraseña tiene minúscula */
  get newPasswordHasLower(): boolean {
    return /[a-z]/.test(this.newPasswordValue);
  }
  /** Valida si la nueva contraseña tiene carácter especial */
  get newPasswordHasSpecial(): boolean {
    return /[!@#$%^&*(),.?':{}|<>_\-+=~`[\]\\;/]/.test(this.newPasswordValue);
  }

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
    this.passwordForm = this.fb.nonNullable.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: [
          '',
          [Validators.required, Validators.minLength(8), passwordComplexityValidator()],
        ],
        repeatPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatch }
    );
  }

  /** Getter para el campo contraseña actual */
  get currentPassword(): FormControl<string> {
    return this.passwordForm.controls.currentPassword;
  }
  /** Getter para el campo nueva contraseña */
  get newPassword(): FormControl<string> {
    return this.passwordForm.controls.newPassword;
  }
  /** Getter para el campo repetir contraseña */
  get repeatPassword(): FormControl<string> {
    return this.passwordForm.controls.repeatPassword;
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
   * Envía el formulario para cambiar la contraseña.
   * Valida los datos y realiza la petición al backend.
   * Muestra mensajes de éxito o error según la respuesta.
   */
  onSubmit() {
    this.isSubmitted = true;
    this.errorMsg = null;
    this.successMsg = null;
    this.passwordForm.markAllAsTouched();

    if (this.passwordForm.invalid) {
      if (this.passwordForm.errors?.['mismatch']) {
        this.showError('Las contraseñas nuevas no coinciden.');
      } else if (this.newPassword.errors?.['passwordComplexity']) {
        this.showError(
          'La contraseña debe tener al menos 8 caracteres, contener una mayúscula, una minúscula, un número y un símbolo especial.'
        );
      }
      return;
    }

    const id = this.auth.getUserId?.();
    if (!id) {
      this.showError('No se pudo identificar el usuario.');
      return;
    }

    const oldPass = this.currentPassword.value;
    const newPass = this.newPassword.value;
    this.loading = true;
    this.userService.changePassword(id, oldPass, newPass).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.isSubmitted = false;
        this.loading = false;
        this.showSuccess('Contraseña actualizada correctamente.');
      },
      error: (err) => {
        this.showError(
          err.status === 400
            ? 'La contraseña actual es incorrecta.'
            : 'No se pudo actualizar la contraseña.'
        );
        this.loading = false;
      },
    });
  }
}
