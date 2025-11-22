import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../service/UserService';
import { AuthService } from '../../service/AuthService';
import { Toast } from '../../components/toast/toast';

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

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly auth: AuthService
  ) {
    this.passwordForm = this.fb.nonNullable.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(5)]],
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
        this.errorMsg = 'Las contraseñas nuevas no coinciden.';
        this.showError(this.errorMsg);
      }
      return;
    }

    const id = this.auth.getUserId?.();
    if (!id) {
      this.errorMsg = 'No se pudo identificar el usuario.';
      this.showError(this.errorMsg);
      return;
    }

    const oldPass = this.currentPassword.value;
    const newPass = this.newPassword.value;
    this.loading = true;
    this.userService.changePassword(id, oldPass, newPass).subscribe({
      next: () => {
        this.successMsg = 'Contraseña actualizada correctamente.';
        this.passwordForm.reset();
        this.isSubmitted = false;
        this.loading = false;
        this.showSuccess(this.successMsg);
      },
      error: (err) => {
        this.errorMsg =
          err.status === 400
            ? 'La contraseña actual es incorrecta.'
            : 'No se pudo actualizar la contraseña.';
        this.showError(this.errorMsg);
        this.loading = false;
      },
    });
  }
}
