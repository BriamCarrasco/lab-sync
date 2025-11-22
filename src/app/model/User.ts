/**
 * Modelo de usuario.
 *
 * Representa los datos de un usuario en la aplicación, incluyendo identificador,
 * nombres, apellidos, nombre de usuario, correo, rut, rol y contraseña.
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
  /** Nombre de usuario */
  username: string;
  /** Correo electrónico */
  email: string;
  /** RUT del usuario */
  rut: string;
  /** Rol del usuario */
  role: string;
  /** Contraseña */
  password?: string;
  /** Primer apellido alternativo */
  lastName?: string;
  /** Segundo apellido alternativo */
  secondLastName?: string;
  /** Nombre de usuario alternativo */
  userName?: string;
}
