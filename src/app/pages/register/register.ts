import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  step = 1; // ← controla el paso actual

  constructor(private readonly fb: FormBuilder) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      secondLastName: ['', Validators.required],
      rut: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
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
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;

    // Procesa el registro
    console.log(this.registerForm.value);
  }
}
