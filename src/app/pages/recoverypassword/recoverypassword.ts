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

@Component({
  selector: 'app-recoverypassword',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
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

  onSubmit() {
    this.isSubmitted = true;
    this.errorMsg = null;
    this.successMsg = null;
    this.passwordForm.markAllAsTouched();

    if (this.passwordForm.invalid) {
      if (this.passwordForm.errors?.['mismatch']) {
        this.errorMsg = 'Las contraseñas nuevas no coinciden.';
      }
      return;
    }

    const id = this.auth.getUserId?.();
    if (!id) {
      this.errorMsg = 'No se pudo identificar el usuario.';
      return;
    }

    const newPass = this.newPassword.value; 
    this.loading = true;
    this.userService.changePassword(id, newPass).subscribe({
      next: () => {
        this.successMsg = 'Contraseña actualizada correctamente.';
        this.passwordForm.reset();
        this.isSubmitted = false;
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'No se pudo actualizar la contraseña.';
        this.loading = false;
      },
    });
  }
}
