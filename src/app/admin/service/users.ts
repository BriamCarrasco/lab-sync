import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { RegisteredUser, RegisterRequest } from '../../service/AuthService';

/**
 * Modelo de usuario para administración.
 *
 * @interface
 */
export interface User {
  /** Identificador único del usuario */
  id: number;
  /** Nombre del usuario */
  name: string;
  /** Primer apellido del usuario */
  firstLastname: string;
  /** Segundo apellido del usuario */
  secondLastname: string;
  /** Correo electrónico */
  email: string;
  /** Nombre de usuario */
  username: string;
  /** RUT del usuario */
  rut: string;
  /** Rol del usuario */
  role: string;
}

/**
 * Servicio para la gestión de usuarios en el módulo de administración.
 *
 * Proporciona métodos para obtener, crear, actualizar y eliminar usuarios
 * mediante peticiones HTTP al backend.
 *
 * @service
 */
@Injectable({ providedIn: 'root' })
export class UsersService {
  /** Cliente HTTP inyectado */
  private readonly http = inject(HttpClient);
  /** URL base para las peticiones de usuario */
  private readonly baseUrl = 'http://localhost:8081/users';
  /** URL base para autenticación y registro */
  private readonly authBaseUrl = 'http://localhost:8081/auth';

  /**
   * Obtiene todos los usuarios.
   * @returns Observable con el listado de usuarios.
   */
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  /**
   * Obtiene un usuario por su ID.
   * @param id Identificador del usuario.
   * @returns Observable con el usuario encontrado.
   */
  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea un nuevo usuario.
   * @param data Datos del usuario a registrar.
   * @returns Observable con el usuario creado.
   */
  create(data: Omit<RegisterRequest, 'role'> & { role?: string }): Observable<User> {
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

  /**
   * Actualiza los datos de un usuario.
   * @param user Usuario con los datos actualizados.
   * @returns Observable con el usuario actualizado.
   */
  update(user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${user.id}`, user);
  }

  /**
   * Elimina un usuario por su ID.
   * @param id Identificador del usuario.
   * @returns Observable vacío cuando la operación finaliza.
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
