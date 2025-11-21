import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User } from '../../model/User';
import { UserService } from '../../service/UserService';
import { AuthService } from '../../service/AuthService';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile implements OnInit {
  profileForm: FormGroup;
  isSubmitted = false;
  canEdit = true;
  user: User | null = null;
  loading = false;
  errorMsg = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly auth: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      secondLastName: ['', Validators.required],
      userName: ['', Validators.required],
      rut: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  private async loadCurrentUser() {
    this.loading = true;
    this.errorMsg = '';
    try {
      // Intentar primero con el id almacenado al hacer login
      const storedId = this.auth.getUserId?.();
      let apiUser: User | undefined;
      if (storedId) {
        apiUser = await firstValueFrom(this.userService.getById(storedId));
      }
      // Fallback: buscar por username si no hay id
      if (!apiUser) {
        let username = this.auth.getUsername();
        if (!username) {
          const token = this.auth.getToken();
          username = this.getUsernameFromToken(token);
        }
        if (!username) {
          this.errorMsg = 'No se pudo identificar el usuario';
          return;
        }
        apiUser = await firstValueFrom(this.userService.getByUsername(username));
        if (!apiUser) {
          this.errorMsg = 'Usuario no encontrado';
          return;
        }
      }
      this.user = apiUser;
      console.log('[Profile] Usuario cargado:', apiUser);
      this.profileForm.patchValue({
        name: apiUser.name,
        lastName: apiUser.firstLastname,
        secondLastName: apiUser.secondLastname,
        userName: apiUser.username,
        rut: apiUser.rut,
        email: apiUser.email,
      });
    } catch {
      this.errorMsg = 'Error al cargar usuario';
    } finally {
      this.loading = false;
    }
  }

  private getUsernameFromToken(token: string | null): string | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload) return null;
      if (typeof payload.sub === 'string' && payload.sub) return payload.sub;
      return null;
    } catch {
      return null;
    }
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

  async onSubmit() {
    this.isSubmitted = true;
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid || !this.user) return;
    this.loading = true;
    this.errorMsg = '';
    try {
      const raw = this.profileForm.getRawValue();
      const payload: Partial<User> = {
        id: this.user.id,
        name: raw.name,
        firstLastname: raw.lastName,
        secondLastname: raw.secondLastName,
        username: raw.userName,
        rut: this.user.rut,
        email: this.user.email,
        role: this.user.role ?? '',
      };
      console.log('[Profile] Payload actualización (enviado):', payload);
      const updated = await firstValueFrom(this.userService.update(this.user.id, payload));
      this.user = updated;
      console.log('[Profile] Usuario actualizado:', updated);
      this.profileForm.patchValue({
        name: updated.name,
        lastName: updated.firstLastname,
        secondLastName: updated.secondLastname,
        userName: updated.username,
      });
    } catch (err: any) {
      this.errorMsg = typeof err?.error === 'string' ? err.error : 'Error al actualizar perfil';
    } finally {
      this.loading = false;
    }
  }
}
