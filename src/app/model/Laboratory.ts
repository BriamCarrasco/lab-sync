/**
 * Modelo de laboratorio.
 *
 * Representa los datos de un laboratorio en la aplicación, incluyendo identificador,
 * nombre, dirección, teléfono, correo electrónico, sitio web y especialidad.
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
  /** Teléfono de contacto */
  phone: string;
  /** Correo electrónico del laboratorio */
  email: string;
  /** Sitio web del laboratorio */
  website?: string;
  /** Especialidad del laboratorio */
  specialty: string;
}
