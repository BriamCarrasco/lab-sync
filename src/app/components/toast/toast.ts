import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente de notificación tipo toast.
 *
 * Muestra mensajes de éxito o error en pantalla de forma temporal.
 * Recibe el mensaje, el tipo y la visibilidad como propiedades.
 *
 * @component
 */
@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  template: `
    @if (show) {
    <div [ngClass]="type === 'success' ? 'toast-success' : 'toast-error'">
      {{ message }}
    </div>
    }
  `,
  styleUrl: './toast.css',
})
export class Toast {
  /**
   * Mensaje a mostrar en el toast.
   */
  @Input() message: string = '';
  /**
   * Indica si el toast está visible.
   */
  @Input() show: boolean = false;
  /**
   * Tipo de toast ('success' | 'error').
   */
  @Input() type: 'success' | 'error' = 'success';
}
