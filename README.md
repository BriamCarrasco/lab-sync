# LabSync

LabSync es una aplicación web desarrollada con Angular para la gestión de laboratorios y resultados de análisis clínicos. Permite a los usuarios agendar citas, consultar resultados y solicitar nuevos exámenes de manera sencilla y segura.

## Tabla de contenidos

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Uso](#uso)
- [Desarrollo](#desarrollo)
- [Pruebas](#pruebas)
- [Despliegue con Docker](#despliegue-con-docker)
- [Recursos adicionales](#recursos-adicionales)

## Características

- Registro y autenticación de usuarios
- Recuperación de contraseña por correo electrónico
- Gestión de laboratorios y usuarios (panel de administración)
- Consulta de resultados y solicitud de análisis clínicos
- Interfaz moderna y responsiva

## Requisitos

- Node.js >= 18.x
- npm >= 9.x
- Angular CLI >= 20.x

## Instalación

Clona el repositorio y navega al directorio del proyecto:

```bash
git clone https://github.com/BriamCarrasco/lab-sync.git
cd lab-sync
```

Instala las dependencias:

```bash
npm install
```

## Uso

Para iniciar el servidor de desarrollo:

```bash
ng serve
```

Accede a la aplicación en [http://localhost:4200](http://localhost:4200).

## Desarrollo

Para generar un nuevo componente, servicio, módulo, etc.:

```bash
ng generate <schematic> <name>
```

Ejemplo:

```bash
ng generate component ejemplo
```

Consulta todos los esquemas disponibles:

```bash
ng generate --help
```

## Pruebas

Ejecuta las pruebas unitarias:

```bash
ng test
```

Ejecuta pruebas end-to-end (e2e):

```bash
ng e2e
```

## Despliegue con Docker

Para construir y levantar la aplicación en un contenedor Docker:

```bash
docker build -t lab-sync .
docker run -p 4200:4200 lab-sync
```

Accede a [http://localhost:4200](http://localhost:4200) en tu navegador.

## Recursos adicionales

- [Angular CLI - Documentación oficial](https://angular.dev/tools/cli)
- [Guía Angular](https://angular.dev/guide)
