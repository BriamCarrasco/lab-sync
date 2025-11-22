import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/AuthService';
import { Toast } from '../../components/toast/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, Toast],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  isSubmitted = false;
  loading = false;
  loginError: string | null = null;

  toastMsg: string = '';
  showToast: boolean = false;
  toastType: 'success' | 'error' = 'success';

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  get username() {
    return this.loginForm.get('username');
  }
  get password() {
    return this.loginForm.get('password');
  }

  showToastMsg(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMsg = msg;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }

  onSubmit() {
    this.isSubmitted = true;
    this.loginError = null;
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;
    this.loading = true;
    const { username, password } = this.loginForm.value;
    this.auth.login({ username, password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.showToastMsg('Inicio de sesión exitoso', 'success');
        const role = res.role?.toUpperCase();
        setTimeout(() => {
          if (role && role.replace(/^ROLE_/, '') === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/home']);
          }
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.showToastMsg('Credenciales inválidas.', 'error');
        } else {
          this.showToastMsg('Error al iniciar sesión. Intenta nuevamente.', 'error');
        }
      },
    });
  }
}
