import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Topbar } from "./components/topbar/topbar";
import { Landing } from "./pages/landing/landing";
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Topbar, Landing, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('lab-sync');

  constructor(private readonly toastr: ToastrService) {}

  showToast() {
    this.toastr.success('Operación exitosa', 'OK');
  }
}
