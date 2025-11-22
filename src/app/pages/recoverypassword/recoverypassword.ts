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

@Component({
  selector: 'app-recoverypassword',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, Toast],
  templateUrl: './recoverypassword.html',
  styleUrl: './recoverypassword.css',
})
export class Recoverypassword {
  passwordsMatch: ValidatorFn = (control: AbstractControl) => {
    const newPass = control.get('newPassword')?.value;
    const repeatPass = control.get('repeatPassword')?.value;
    return newPass === repeatPass ? null : { mismatch: true };
  };

  passwordForm!: FormGroup<{
    currentPassword: FormControl<string>;
    newPassword: FormControl<string>;
    repeatPassword: FormControl<string>;
  }>;

  isSubmitted = false;
  errorMsg: string | null = null;
  successMsg: string | null = null;
  loading = false;

  toastMsg: string = '';
  showToast: boolean = false;
  toastType: 'success' | 'error' = 'success';

  get newPasswordValue(): string {
    return this.newPassword.value || '';
  }
  get newPasswordHasMinLength(): boolean {
    return this.newPasswordValue.length >= 8;
  }
  get newPasswordHasNumber(): boolean {
    return /\d/.test(this.newPasswordValue);
  }
  get newPasswordHasUpper(): boolean {
    return /[A-Z]/.test(this.newPasswordValue);
  }
  get newPasswordHasLower(): boolean {
    return /[a-z]/.test(this.newPasswordValue);
  }
  get newPasswordHasSpecial(): boolean {
    return /[!@#$%^&*(),.?':{}|<>_\-+=~`[\]\\;/]/.test(this.newPasswordValue);
  }

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

  get currentPassword(): FormControl<string> {
    return this.passwordForm.controls.currentPassword;
  }
  get newPassword(): FormControl<string> {
    return this.passwordForm.controls.newPassword;
  }
  get repeatPassword(): FormControl<string> {
    return this.passwordForm.controls.repeatPassword;
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
