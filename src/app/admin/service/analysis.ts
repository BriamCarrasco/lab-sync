import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Analysis, Result } from '../../model/Analysis';

/**
 * Servicio para la gestión de análisis en el módulo de administración.
 *
 * Proporciona métodos para obtener, crear, actualizar y eliminar análisis
 * mediante peticiones HTTP al backend. También permite consultar resultados
 * asociados a los análisis.
 *
 * @service
 */
@Injectable({ providedIn: 'root' })
export class AnalysisService {
  /** Cliente HTTP inyectado */
  private readonly http = inject(HttpClient);
  /** URL base para las peticiones de análisis */
  private readonly baseUrl = 'http://localhost:8083/analysis';
  /** URL base para las peticiones de resultados */
  private readonly resultsUrl = 'http://localhost:8083/results';

  /**
   * Obtiene todos los análisis.
   * @returns Observable con el listado de análisis.
   */
  getAll(): Observable<Analysis[]> {
    return this.http.get<Analysis[]>(this.baseUrl);
  }

  /**
   * Obtiene un análisis por su ID.
   * @param id Identificador del análisis.
   * @returns Observable con el análisis encontrado.
   */
  getById(id: number): Observable<Analysis> {
    return this.http.get<Analysis>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea un nuevo análisis.
   * @param analysis Datos del análisis a crear.
   * @returns Observable con el análisis creado.
   */
  create(analysis: Omit<Analysis, 'id' | 'createdAt' | 'updatedAt'>): Observable<Analysis> {
    return this.http.post<Analysis>(this.baseUrl, analysis);
  }

  /**
   * Actualiza los datos de un análisis.
   * @param id Identificador del análisis.
   * @param analysis Datos actualizados.
   * @returns Observable con el análisis actualizado.
   */
  update(id: number, analysis: Analysis): Observable<Analysis> {
    return this.http.put<Analysis>(`${this.baseUrl}/${id}`, analysis);
  }

  /**
   * Elimina un análisis por su ID.
   * @param id Identificador del análisis.
   * @returns Observable vacío cuando la operación finaliza.
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene análisis por ID de paciente.
   * @param patientId ID del paciente.
   * @returns Observable con el listado de análisis del paciente.
   */
  getByPatientId(patientId: number): Observable<Analysis[]> {
    return this.http.get<Analysis[]>(`${this.baseUrl}/patient/${patientId}`);
  }

  /**
   * Obtiene análisis por ID de laboratorio.
   * @param laboratoryId ID del laboratorio.
   * @returns Observable con el listado de análisis del laboratorio.
   */
  getByLaboratoryId(laboratoryId: number): Observable<Analysis[]> {
    return this.http.get<Analysis[]>(`${this.baseUrl}/laboratory/${laboratoryId}`);
  }

  /**
   * Obtiene análisis por estado.
   * @param status Estado del análisis.
   * @returns Observable con el listado de análisis filtrados.
   */
  getByStatus(status: string): Observable<Analysis[]> {
    return this.http.get<Analysis[]>(`${this.baseUrl}/status/${status}`);
  }

  /**
   * Obtiene análisis por ID de paciente y estado.
   * @param patientId ID del paciente.
   * @param status Estado del análisis.
   * @returns Observable con el listado de análisis filtrados.
   */
  getByPatientIdAndStatus(patientId: number, status: string): Observable<Analysis[]> {
    return this.http.get<Analysis[]>(`${this.baseUrl}/patient/${patientId}/status/${status}`);
  }

  /**
   * Obtiene todos los resultados.
   * @returns Observable con el listado de resultados.
   */
  getAllResults(): Observable<Result[]> {
    return this.http.get<Result[]>(this.resultsUrl);
  }

  /**
   * Obtiene un resultado por su ID.
   * @param id Identificador del resultado.
   * @returns Observable con el resultado encontrado.
   */
  getResultById(id: number): Observable<Result> {
    return this.http.get<Result>(`${this.resultsUrl}/${id}`);
  }

  /**
   * Obtiene resultados por ID de análisis.
   * @param analysisId ID del análisis.
   * @returns Observable con el listado de resultados del análisis.
   */
  getResultsByAnalysisId(analysisId: number): Observable<Result[]> {
    return this.http.get<Result[]>(`${this.resultsUrl}/analysis/${analysisId}`);
  }
}
