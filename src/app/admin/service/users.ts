import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { RegisteredUser, RegisterRequest } from '../../service/AuthService';

// Modelo de usuario administrable (sin password en la representación)
export interface User {
  id: number;
  name: string;
  firstLastname: string;
  secondLastname: string;
  email: string;
  username: string;
  rut: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8081/users';
  private readonly authBaseUrl = 'http://localhost:8081/auth';

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  // El backend no expone POST /users, reutilizamos /auth/register
  create(data: Omit<RegisterRequest, 'role'> & { role?: string }): Observable<User> {
    // role opcional: si no viene backend asignará por defecto
    const payload: RegisterRequest = {
      name: data.name,
      firstLastname: data.firstLastname,
      secondLastname: data.secondLastname,
      email: data.email,
      username: data.username,
      password: data.password,
      rut: data.rut,
      role: data.role || '',
    };
    return this.http.post<RegisteredUser>(`${this.authBaseUrl}/register`, payload).pipe(
      map((r) => ({
        id: r.id,
        name: r.name,
        firstLastname: r.firstLastname,
        secondLastname: r.secondLastname,
        email: r.email,
        username: r.username,
        rut: r.rut,
        role: r.role,
      }))
    );
  }

  update(user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${user.id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
