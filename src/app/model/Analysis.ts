/**
 * Modelo de resultado de análisis.
 *
 * Representa un resultado individual dentro de un análisis,
 * incluyendo el parámetro medido, valor, unidad y rango de referencia.
 *
 * @interface
 */
export interface Result {
  /** Identificador único del resultado */
  id: number;
  /** Nombre del parámetro analizado */
  parameterName: string;
  /** Valor obtenido en el análisis */
  value: string;
  /** Unidad de medida del parámetro */
  unit: string;
  /** Rango de referencia normal del parámetro */
  referenceRange: string;
  /** Observaciones adicionales sobre el resultado */
  observations?: string;
  /** Fecha de creación del resultado */
  createdAt?: string;
}

/**
 * Modelo de análisis clínico.
 *
 * Representa un análisis completo realizado a un paciente en un laboratorio,
 * incluyendo su estado y resultados asociados.
 *
 * @interface
 */
export interface Analysis {
  /** Identificador único del análisis */
  id: number;
  /** ID del paciente asociado al análisis (opcional) */
  patientId?: number;
  /** ID del laboratorio donde se realizó */
  laboratoryId: number;
  /** ID del usuario que creó el análisis */
  userId: number;
  /** Estado del análisis (PENDIENTE, EN_PROCESO, COMPLETADO) */
  status: string;
  /** Fecha de creación del análisis */
  createdAt?: string;
  /** Fecha de última actualización */
  updatedAt?: string;
  /** Resultados del análisis */
  results?: Result[];
}
