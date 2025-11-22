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

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, Toast],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerForm: FormGroup;
  isSubmitted = false;
  step = 1;
  loading = false;

  toastMsg: string = '';
  showToast: boolean = false;
  toastType: 'success' | 'error' = 'success';

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

  get name() {
    return this.registerForm.get('name');
  }
  get lastName() {
    return this.registerForm.get('lastName');
  }
  get secondLastName() {
    return this.registerForm.get('secondLastName');
  }
  get rut() {
    return this.registerForm.get('rut');
  }
  get username() {
    return this.registerForm.get('username');
  }
  get email() {
    return this.registerForm.get('email');
  }
  get password() {
    return this.registerForm.get('password');
  }

  get passwordValue(): string {
    return this.password?.value || '';
  }
  get passwordHasMinLength(): boolean {
    return this.passwordValue.length >= 8;
  }
  get passwordHasNumber(): boolean {
    return /\d/.test(this.passwordValue);
  }
  get passwordHasUpper(): boolean {
    return /[A-Z]/.test(this.passwordValue);
  }
  get passwordHasLower(): boolean {
    return /[a-z]/.test(this.passwordValue);
  }
  get passwordHasSpecial(): boolean {
    return /[!@#$%^&*(),.?':{}|<>_\-+=~`[\]\\;/]/.test(this.passwordValue);
  }

  nextStep() {
    this.isSubmitted = true;
    if (this.name?.valid && this.lastName?.valid && this.secondLastName?.valid && this.rut?.valid) {
      this.step = 2;
      this.isSubmitted = false;
    }
  }

  prevStep() {
    this.step = 1;
    this.isSubmitted = false;
  }

  showToastMsg(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMsg = msg;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }

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
