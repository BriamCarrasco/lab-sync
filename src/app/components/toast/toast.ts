import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  @Input() message: string = '';
  @Input() show: boolean = false;
  @Input() type: 'success' | 'error' = 'success';
}
