import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../service/users';
import { LaboratoriesService } from '../../service/laboratories';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css'],
  imports: [CommonModule, RouterModule]
})
export class AdminHomeComponent implements OnInit {
  totalUsers = 0;
  totalLaboratories = 0;
  loading = false;

  constructor(
    private readonly usersService: UsersService,
    private readonly laboratoriesService: LaboratoriesService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.usersService.getAll().subscribe({
      next: (users) => {
        this.totalUsers = users.length;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
    this.laboratoriesService.getAll().subscribe({
      next: (labs) => {
        this.totalLaboratories = labs.length;
      },
    });
  }
}
