import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../model/User';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  profileForm: FormGroup;
  isSubmitted = false;
  canEdit = true;

  // Simulación de datos de usuario (reemplaza con tu servicio real)
  user: User = {
    id: 1,
    name: 'Juan',
    lastName: 'Pérez',
    secondLastName: 'Gómez',
    userName: 'juanp',
    rut: '12345678-9',
    email: 'juan@example.com',
    role: 'user',
    password: '',
  };

  constructor(private readonly fb: FormBuilder) {
    this.profileForm = this.fb.group({
      name: [this.user.name, Validators.required],
      lastName: [this.user.lastName, Validators.required],
      secondLastName: [this.user.secondLastName, Validators.required],
      userName: [this.user.userName, Validators.required],
      rut: [{ value: this.user.rut, disabled: true }],
      email: [{ value: this.user.email, disabled: true }],
    });
  }

  get name() {
    return this.profileForm.get('name');
  }
  get lastName() {
    return this.profileForm.get('lastName');
  }
  get secondLastName() {
    return this.profileForm.get('secondLastName');
  }
  get userName() {
    return this.profileForm.get('userName');
  }
  get rut() {
    return this.profileForm.get('rut');
  }
  get email() {
    return this.profileForm.get('email');
  }

  onSubmit() {
    this.isSubmitted = true;
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) return;
    // Aquí iría la lógica para guardar los cambios
    console.log('Datos actualizados:', this.profileForm.getRawValue());
  }
}
