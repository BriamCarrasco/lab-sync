/**
 * Punto de entrada principal de la aplicación Angular.
 *
 * Este archivo inicializa la aplicación usando la función `bootstrapApplication`
 * y configura el módulo raíz y la configuración de la aplicación.
 *
 * @file main.ts
 * @author Briam
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/**
 * Inicializa la aplicación Angular con la configuración especificada.
 * Si ocurre un error durante el arranque, se muestra en consola.
 */
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
