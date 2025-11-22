import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Modelo de laboratorio para administración.
 *
 * @interface
 */
export interface Laboratory {
  /** Identificador único del laboratorio */
  id: number;
  /** Nombre del laboratorio */
  name: string;
  /** Dirección del laboratorio */
  address: string;
  /** Especialidad del laboratorio */
  specialty: string;
  /** Teléfono de contacto */
  phone: string;
  /** Correo electrónico del laboratorio */
  email: string;
}

/**
 * Servicio para la gestión de laboratorios en el módulo de administración.
 *
 * Proporciona métodos para obtener, crear, actualizar, eliminar y buscar laboratorios
 * mediante peticiones HTTP al backend.
 *
 * @service
 */
@Injectable({ providedIn: 'root' })
export class LaboratoriesService {
  /** Cliente HTTP inyectado */
  private readonly http = inject(HttpClient);
  /** URL base para las peticiones de laboratorio */
  private readonly baseUrl = 'http://localhost:8082/api/laboratories';

  /**
   * Obtiene todos los laboratorios.
   * @returns Observable con el listado de laboratorios.
   */
  getAll(): Observable<Laboratory[]> {
    return this.http.get<Laboratory[]>(this.baseUrl);
  }

  /**
   * Obtiene un laboratorio por su ID.
   * @param id Identificador del laboratorio.
   * @returns Observable con el laboratorio encontrado.
   */
  getById(id: number): Observable<Laboratory> {
    return this.http.get<Laboratory>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea un nuevo laboratorio.
   * @param lab Datos del laboratorio a crear.
   * @returns Observable con el laboratorio creado.
   */
  create(lab: Omit<Laboratory, 'id'>): Observable<Laboratory> {
    return this.http.post<Laboratory>(this.baseUrl, lab);
  }

  /**
   * Actualiza los datos de un laboratorio.
   * @param id Identificador del laboratorio.
   * @param lab Datos actualizados.
   * @returns Observable con el laboratorio actualizado.
   */
  update(id: number, lab: Laboratory): Observable<Laboratory> {
    return this.http.put<Laboratory>(`${this.baseUrl}/${id}`, lab);
  }

  /**
   * Elimina un laboratorio por su ID.
   * @param id Identificador del laboratorio.
   * @returns Observable vacío cuando la operación finaliza.
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Busca laboratorios por nombre.
   * @param name Nombre del laboratorio.
   * @returns Observable con el listado de laboratorios encontrados.
   */
  searchByName(name: string): Observable<Laboratory[]> {
    return this.http.get<Laboratory[]>(`${this.baseUrl}/name/${name}`);
  }

  /**
   * Busca laboratorios por especialidad.
   * @param specialty Especialidad del laboratorio.
   * @returns Observable con el listado de laboratorios encontrados.
   */
  searchBySpecialty(specialty: string): Observable<Laboratory[]> {
    return this.http.get<Laboratory[]>(`${this.baseUrl}/specialty/${specialty}`);
  }
}
