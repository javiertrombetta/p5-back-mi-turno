# MI-TURNO-WEB API

Este repositorio contiene el código fuente del backend para **MI TURNO WEB APP**.

## Integrantes

- Dario Andrada
- Belen Banegas
- Valentin Guardia
- Franco Prandi
- Javier Trombetta

## Requisitos previos

- Node.js (v14.0.0 o superior)
- npm (generalmente viene con Node.js)

## Instalación

1. **Cloná el repositorio.**
   Dependiendo de tu preferencia, clona el repositorio utilizando HTTP, SSH o GitHub CLI:

   ```bash
      git clone https://github.com/javiertrombetta/p5-back-mi-turno.git
   ```
<BR>

2. **Instalá las dependencias:**

   ```bash
      cd p5-back-mi-turno
      npm install
   ```

## Configuración

Creá un archivo `.env` en el directorio raíz del proyecto y configura las siguientes variables de entorno:

   ```env
   # Configuración de la base de datos
   DB_HOST=[URL_DE_BASE_DE_DATOS]
   DB_NAME=[NOMBRE_DE_BASE_DE_DATOS]
   DB_USER=[USUARIO]
   DB_PASSWORD=[CONTRASEÑA]

   # Configuración del servidor
   SERVER_PORT=[PUERTO_DE_SERVIDOR]
   CORS_ORIGIN=[URL_APP_FRONT]

   # Configuración del servicio de correo electrónico
   MAIL_SERVICE=[NOMBRE_DEL_SERVICIO]
   MAIL_RESET_PASSWORD_URL=[URL_DE_SITIO_WEB]
   MAIL_USERNAME=[CUENTA_DE_EMAIL]
   MAIL_PASSWORD=[CONTRASEÑA_DE_CUENTA_DE_EMAIL]

   # Configuración de JSON Web Token
   JWT_SECRET=[SECRETO_PARA_ENCRIPTAR]   
   ```

## Uso

1. **Iniciar la aplicación:**
   Para iniciar la aplicación, ejecuta:

   ```bash
      npm start
   ```
   *La aplicación se iniciará en http://localhost:3000.*
   
   <BR>

2. **Modificar el Parámetro de Sincronización:**
   Dentro de este archivo existe una variable llamada `forceSync`. Esta variable controla cómo se sincroniza la base de datos cuando iniciás la aplicación. 

   - Si `forceSync` está configurado como `true`, la base de datos se sincronizará forzando una actualización de la estructura (lo que puede resultar en la pérdida de datos existentes). 
   - Si está configurado como `false`, la base de datos se sincronizará sin modificar la estructura existente.

   *Inicialmente `forceSync` se encuentra en `true`. Tenés que cambiar este comportamiento para que no se vuelvan a crear las tablas y las relaciones de la base de datos.*
   
   Para cambiar el comportamiento de sincronización, editá la línea:
   ```javascript
   const forceSync = true; // Cambiar a false para no forzar la sincronización


## Estructura del proyecto
```bash
   /p5-back-mi-turno
   |-- /src
   |   |-- /config            # Configuraciones de la aplicación (base de datos, correo electrónico, etc.)
   |   |-- /controllers       # Controladores para manejar la lógica de negocio
   |   |-- /middlewares       # Middlewares para el manejo de autenticación y roles
   |   |-- /models            # Modelos de Sequelize para representar estructuras de datos
   |   |-- /routes            # Rutas de Express para manejar las solicitudes HTTP
   |   |-- /tests             # Tests (actualmente vacío)
   |   |-- /utils             # Utilidades varias, incluyendo validaciones
   |   |-- server.js          # Punto de entrada principal de la aplicación
   |-- .env                   # Archivo para variables de entorno (no incluido en el repositorio por seguridad)
   |-- .gitignore             # Archivos y directorios ignorados por Git
   |-- package.json           # Dependencias y scripts de NPM
   |-- README.md              # Documentación del proyecto
```


## Rutas API
Las rutas de la API y sus respectivos controladores se encuentran en la carpeta `routes` y `controllers`, respectivamente.

## Rutas de Branches (`/branches`)

### Super
- `POST /create`: Crear una nueva sucursal.
- `PUT /update/:id`: Actualizar una sucursal existente.
- `DELETE /delete/:id`: Eliminar una sucursal existente.

### Admin
- `GET /by-business/:businessId`: Obtener todas las sucursales de una empresa específica.

### Operador
- `GET /assigned`: Obtener las sucursales asignadas al operador.

### Todos los usuarios
- `GET /all`: Obtener todas las sucursales.
- `GET /:id`: Obtener detalles de una sucursal específica.

## Rutas de Business (`/business`)

### Super
- `POST /create`: Crear una nueva empresa.
- `PUT /update/:id`: Actualizar una empresa existente.
- `DELETE /:id`: Eliminar una empresa existente.

### Super | Admin
- `GET /all`: Obtener todas las empresas o las empresas específicas del usuario administrador.
- `GET /:id`: Obtener detalles de una empresa específica.

## Rutas de Users (`/users`)

### Super
- `POST /create`: Crear un nuevo usuario.
- `POST /:dni/reset-password`: Restablecer la contraseña de un usuario.
- `POST /:dni/assign-role`: Asignar un rol a un usuario.
- `PUT /:dni`: Actualizar un usuario por DNI.
- `GET /all`: Obtener todos los usuarios.
- `GET /:dni`: Obtener un usuario por DNI.
- `DELETE /:dni`: Eliminar un usuario por DNI.

### Admin
- `PUT /:dni/depromote`: Depromocionar a un operador a usuario.

### Todos los usuarios
- `GET /me`: Obtener información del usuario actual.
- `PUT /me/change-password`: Cambiar la contraseña del usuario actual.
- `PUT /me`: Actualizar el usuario actual.

### No autenticado
- `POST /register`: Registrar un nuevo usuario.
- `POST /login`: Iniciar sesión.
- `POST /forgot-password`: Solicitar restablecimiento de contraseña.
- `POST /reset-password`: Restablecer contraseña.

## Rutas de Reservations (`/reservations`)

### Super
- `GET /all`: Obtener todas las reservas.
- `GET /:id`: Obtener una reserva por ID.
- `PUT /modify/:id`: Modificar una reserva.
- `DELETE /:id`: Eliminar una reserva.

### Admin
- `GET /metrics`: Obtener métricas de reservas.

### Operador
- `GET /branch`: Obtener reservas de una sucursal específica.
- `PUT /update/:id`: Actualizar el estado de una reserva.

### Todos los usuarios
- `POST /create`: Crear una nueva reserva.
- `GET /my`: Obtener reservas del usuario actual.



## Contribución

Si deseas contribuir a este proyecto, por favor sigue estos pasos:

1. **Haz un fork del repositorio.**
2. **Crea una nueva rama para tu característica o corrección:**
   ```bash
      git checkout -b new-feature
   ```
3. **Realiza tus cambios y haz commit:**
   ```bash
      git commit -m 'feat: add new features'
   ```
4. **Haz push a la rama:**
   ```bash
      git push origin new-feature
   ```
5. **Crea un pull request en GitHub.**

## Problemas y Sugerencias
 Si encontrás algún problema o tenés alguna sugerencia, por favor, abrí un `issue` en este repositorio.


###  ¡Esperamos que disfrutes MI TURNO WEB APP!
Equipo de desarrollo.