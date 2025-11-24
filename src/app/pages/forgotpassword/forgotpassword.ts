import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Toast } from '../../components/toast/toast';

/**
 * Componente para recuperación de contraseña.
 *
 * Permite al usuario solicitar el envío de un enlace de recuperación de contraseña
 * ingresando su correo electrónico. Muestra mensajes mediante toast.
 *
 * @component
 */
@Component({
  selector: 'app-forgotpassword',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, Toast],
  templateUrl: './forgotpassword.html',
  styleUrl: './forgotpassword.css',
})
export class Forgotpassword {
  /**
   * Formulario reactivo para ingresar el correo.
   */
  recoveryForm: FormGroup;
  /**
   * Indica si el formulario fue enviado.
   */
  isSubmitted = false;
  /**
   * Indica si está en proceso de envío.
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

  /**
   * Constructor del componente.
   * @param fb FormBuilder para crear el formulario.
   */
  constructor(private readonly fb: FormBuilder) {
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  /**
   * Getter para el campo email.
   */
  get email() {
    return this.recoveryForm.get('email');
  }

  /**
   * Muestra un mensaje en el toast.
   * @param msg Mensaje a mostrar.
   * @param type Tipo de toast.
   */
  showToastMsg(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMsg = msg;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }

  /**
   * Envía el formulario para recuperar la contraseña.
   * Simula el envío del enlace y muestra el mensaje mediante toast.
   */
  onSubmit() {
    this.isSubmitted = true;
    this.recoveryForm.markAllAsTouched();
    if (this.recoveryForm.invalid) return;
    this.loading = true;

    setTimeout(() => {
      this.loading = false;
      this.showToastMsg('Se ha enviado el enlace de recuperación a tu correo.', 'success');
    }, 1500);
  }
}
