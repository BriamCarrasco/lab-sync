import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from '../../service/AuthService';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerForm: FormGroup;
  isSubmitted = false;
  step = 1; // controla el paso actual
  loading = false;
  registerError: string | null = null;
  registerSuccess: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      secondLastName: ['', Validators.required],
      rut: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{7,8}-[\dkK]$/), // formato básico RUT
        ],
      ],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]],
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

  nextStep() {
    this.isSubmitted = true;
    // Solo avanza si los campos del primer paso son válidos
    if (this.name?.valid && this.lastName?.valid && this.secondLastName?.valid && this.rut?.valid) {
      this.step = 2;
      this.isSubmitted = false;
    }
  }

  prevStep() {
    this.step = 1;
    this.isSubmitted = false;
  }

  onSubmit() {
    this.isSubmitted = true;
    this.registerError = null;
    this.registerSuccess = null;
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;
    this.loading = true;

    const formValue = this.registerForm.value;
    const payload: RegisterRequest = {
      name: formValue.name,
      firstLastname: formValue.lastName, // <-- debe coincidir con el backend
      secondLastname: formValue.secondLastName, // <-- debe coincidir con el backend
      email: formValue.email,
      username: formValue.username,
      password: formValue.password,
      rut: formValue.rut,
      role: '',
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.registerSuccess = 'Registro exitoso. Serás redirigido al login.';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.registerError = 'El nombre de usuario o correo ya está en uso.';
        } else {
          this.registerError = 'Error al registrar. Intenta nuevamente.';
        }
      },
    });
  }
}
