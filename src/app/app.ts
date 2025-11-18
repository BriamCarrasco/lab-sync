import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Topbar } from "./components/topbar/topbar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Topbar],
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
