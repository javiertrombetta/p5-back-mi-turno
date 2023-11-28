# MI-TURNO-WEB API

Este repositorio contiene el código fuente del backend para **MI TURNO WEB APP**.

<br>

## Integrantes

- Dario Andrada
- Belen Banegas
- Valentin Guardia
- Franco Prandi
- Javier Trombetta


<br>


## Utilización en entorno de **Desarrollo**

### Requisitos previos

- Node.js (v14.0.0 o superior)
- npm (generalmente viene con Node.js)

### Instalación

1. **Cloná el repositorio.**
   Dependiendo de tu preferencia, clona el repositorio utilizando HTTP, SSH o GitHub CLI:

   ```bash
      git clone https://github.com/javiertrombetta/p5-back-mi-turno.git
   ```

2. **Instalá las dependencias:**

   ```bash
      cd p5-back-mi-turno
      npm install
   ```

### Configuración

Creá un archivo `.env` en el directorio raíz del proyecto y configura las siguientes variables de entorno:

   ```env
   # Development environment variables
   NODE_ENV=development

   # Configuración de la base de datos
   DB_HOST=[URL_DE_BASE_DE_DATOS]
   DB_NAME=[NOMBRE_DE_BASE_DE_DATOS]
   DB_USER=[USUARIO]
   DB_PASSWORD=[CONTRASEÑA]

   # Server configuration
   SERVER_PORT=[PUERTO_DE_SERVIDOR]

   # Client configuration
   CORS_ORIGIN=[URL_APP_FRONT]

   # Configuración del servicio de correo electrónico
   MAIL_SERVICE=[NOMBRE_DEL_SERVICIO]
   MAIL_RESET_PASSWORD_URL=[URL_DE_SITIO_WEB]
   MAIL_USERNAME=[CUENTA_DE_EMAIL]
   MAIL_PASSWORD=[CONTRASEÑA_DE_CUENTA_DE_EMAIL]

   # Configuración de JSON Web Token
   JWT_SECRET=[SECRETO_PARA_ENCRIPTAR]   
   ```

### Uso

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


<br>


## Utilización en entorno de **Producción**

### Configuración

1. **Archivo de entorno:**

   Configura el archivo `.env.production` con las variables de entorno adecuadas para el entorno de producción, incluyendo bases de datos de producción, puertos, etc.

   ```env
      # Development environment variables
      NODE_ENV=production

      # Configuración de la base de datos
      DB_HOST=[URL_DE_BASE_DE_DATOS]
      DB_NAME=[NOMBRE_DE_BASE_DE_DATOS]
      DB_USER=[USUARIO]
      DB_PASSWORD=[CONTRASEÑA]

      # Server configuration
      SERVER_PORT=[PUERTO_DE_SERVIDOR]

      # Client configuration
      CORS_ORIGIN=[URL_APP_FRONT]

      # Configuración del servicio de correo electrónico
      MAIL_SERVICE=[NOMBRE_DEL_SERVICIO]
      MAIL_RESET_PASSWORD_URL=[URL_DE_SITIO_WEB]
      MAIL_USERNAME=[CUENTA_DE_EMAIL]
      MAIL_PASSWORD=[CONTRASEÑA_DE_CUENTA_DE_EMAIL]

      # Configuración de JSON Web Token
      JWT_SECRET=[SECRETO_PARA_ENCRIPTAR]   
      ```
  

2. **Iniciá la aplicación:**

   ```javascript
      NODE_ENV=production npm start
   ```

   *Nota: Es importante que todas las configuraciones y recursos necesarios (como bases de datos y servicios de correo electrónico) estén accesibles en el entorno de producción.*

<br>


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


<br>


## Rutas API
Las rutas de la API y sus respectivos controladores se encuentran en la carpeta `routes` y `controllers`, respectivamente.


<br>


### Rutas de Branches (`/branches`)

#### Super
- `POST /`: Crear una nueva sucursal.
- `PUT /:id`: Actualizar una sucursal existente.
- `DELETE /:id`: Eliminar una sucursal existente.

#### Admin
- `GET /business/:businessId`: Obtener todas las sucursales de una empresa específica.

#### Operador
- `GET /assigned`: Obtener las sucursales asignadas al operador.

#### Todos los usuarios
- `GET /`: Obtener todas las sucursales.
- `GET /:id`: Obtener detalles de una sucursal específica.
- `GET /:id/schedules`: Obtener horarios de una sucursal.
- `GET /:id/available-schedules`: Obtener horarios disponibles de una sucursal.
- `GET /:id/critical-schedules`: Obtener horarios críticos de una sucursal.


<br>


### Rutas de Business (`/business`)

#### Super
- `POST /`: Crear una nueva empresa.
- `PUT /:id`: Actualizar una empresa existente.
- `DELETE /:id`: Eliminar una empresa existente.

#### Super | Admin
- `GET /`: Obtener todas las empresas o las empresas específicas del usuario administrador.
- `GET /:id`: Obtener detalles de una empresa específica.


<br>


### Rutas de Users (`/users`)

#### Super
- `POST /`: Crear un nuevo usuario.
- `POST /:dni/reset-password`: Restablecer la contraseña de un usuario.
- `POST /:dni/assign-role`: Asignar un rol a un usuario.
- `PUT /:dni`: Actualizar un usuario por DNI.
- `GET /`: Obtener todos los usuarios.
- `GET /:dni`: Obtener un usuario por DNI.
- `DELETE /:dni`: Eliminar un usuario por DNI.

#### Admin
- `PUT /:dni/depromote`: Depromocionar a un operador a usuario.

#### Todos los usuarios
- `GET /me`: Obtener información del usuario actual.
- `PUT /me/change-password`: Cambiar la contraseña del usuario actual.
- `PUT /me`: Actualizar el usuario actual.
- `DELETE /me`: Eliminar el usuario actual.

#### No autenticado
- `POST /register`: Registrar un nuevo usuario.
- `POST /login`: Iniciar sesión.
- `POST /logout`: Cerrar sesión.
- `POST /forgot-password`: Solicitar restablecimiento de contraseña.
- `POST /reset-password`: Restablecer contraseña.


<br>


### Rutas de Reservations (`/reservations`)

#### Super
- `GET /`: Obtener todas las reservas.
- `GET /:id`: Obtener una reserva por ID.
- `PUT /:id`: Modificar una reserva.
- `DELETE /:id`: Eliminar una reserva.

#### Admin
- `GET /metrics`: Obtener métricas de reservas.

#### Operador
- `GET /branch`: Obtener reservas de una sucursal específica.
- `PUT /status/:id`: Actualizar el estado de una reserva.

#### Todos los usuarios
- `POST /`: Crear una nueva reserva.
- `GET /me`: Obtener reservas del usuario actual.


<br>


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


<br>


## Problemas y Sugerencias
 Si encontrás algún problema o tenés alguna sugerencia, por favor, abrí un `issue` en este repositorio.


<br>


###  ¡Esperamos que disfrutes MI TURNO WEB APP!
*Grupo 6 de Mi Turno Web App*