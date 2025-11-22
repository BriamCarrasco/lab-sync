import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Topbar } from './components/topbar/topbar';
import { Footer } from './components/footer/footer';

/**
 * Componente principal de la aplicación.
 *
 * Este componente actúa como contenedor raíz y gestiona la estructura básica,
 * incluyendo la barra superior, el contenido enrutado y el pie de página.
 *
 * @component
 * @example
 * <app-root></app-root>
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Topbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  /**
   * Título de la aplicación.
   */
  protected readonly title = signal('lab-sync');

  /**
   * Constructor del componente.
   * @param toastr Servicio para mostrar notificaciones tipo toast.
   */
  constructor(private readonly toastr: ToastrService) {}

  /**
   * Muestra una notificación de éxito.
   */
  showToast() {
    this.toastr.success('Operación exitosa', 'OK');
  }
}
