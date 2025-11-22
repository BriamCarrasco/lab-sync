import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../model/User';

/**
 * Servicio para la gestión de usuarios.
 *
 * Proporciona métodos para obtener, actualizar y cambiar la contraseña de usuarios
 * mediante peticiones HTTP al backend.
 *
 * @service
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  /**
   * URL base para las peticiones de usuario.
   */
  private readonly base = 'http://localhost:8081/users';

  /**
   * Constructor del servicio.
   * @param http Cliente HTTP para realizar las peticiones.
   */
  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene todos los usuarios.
   * @returns Observable con el listado de usuarios.
   */
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.base);
  }

  /**
   * Obtiene un usuario por su ID.
   * @param id Identificador del usuario.
   * @returns Observable con el usuario encontrado.
   */
  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  /**
   * Busca un usuario por su nombre de usuario.
   * @param username Nombre de usuario.
   * @returns Observable con el usuario encontrado o undefined.
   */
  getByUsername(username: string): Observable<User | undefined> {
    return this.getAll().pipe(
      map((users) => {
        return (
          users.find((u: any) => u.userName === username) ||
          users.find((u: any) => u.username === username) ||
          users.find(
            (u: any) => (u.userName || u.username || '').toLowerCase() === username.toLowerCase()
          )
        );
      })
    );
  }

  /**
   * Actualiza los datos de un usuario.
   * @param id Identificador del usuario.
   * @param user Datos parciales a actualizar.
   * @returns Observable con el usuario actualizado.
   */
  update(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, user);
  }

  /**
   * Cambia la contraseña de un usuario.
   * @param id Identificador del usuario.
   * @param oldPassword Contraseña actual.
   * @param newPassword Nueva contraseña.
   * @returns Observable vacío cuando la operación finaliza.
   */
  changePassword(id: number, oldPassword: string, newPassword: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/password`, {
      oldPassword,
      newPassword,
    });
  }
}
