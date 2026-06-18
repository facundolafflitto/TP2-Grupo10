# TP2 Trabajo Practico

Proyecto Node.js con Express, Sequelize, SQL Server y frontend en HTML, CSS y JavaScript simple. La API permite registrar usuarios, iniciar sesion, listar productos, comprar productos, administrar stock y realizar operaciones CRUD sobre productos y categorias.

## Requisitos

- Node.js
- npm
- SQL Server
- Base de datos `MarketplaceTP`

## Instalacion

```bash
npm install
```

Crear un archivo `.env` en la raiz del proyecto usando como base `.env.example`:

```env
JWT_SECRET=reemplazar_por_una_clave_larga_y_segura
JWT_EXPIRES_IN=8h
ADMIN_REGISTER_CODE=reemplazar_por_un_codigo_privado
DB_NAME=MarketplaceTP
DB_USER=marketplace_user
DB_PASSWORD=reemplazar_por_la_password
DB_HOST=127.0.0.1
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
```

## Ejecutar el servidor

```bash
npm start
```

El servidor queda disponible en:

```text
http://localhost:3000
```

El frontend se sirve directamente desde la carpeta `public`, por lo que no necesita compilacion ni herramientas adicionales.

## Estructura MVC

- `models`: modelos Sequelize y relaciones.
- `controllers`: logica de negocio de cada recurso.
- `routes`: definicion de endpoints REST.
- `middlewares`: autenticacion, autorizacion, logs y manejo de errores.
- `connection`: conexion a SQL Server con Sequelize.
- `config`: configuraciones generales del proyecto.
- `services`: servicios reutilizables.
- `utils`: utilidades compartidas.
- `public`: vistas y logica del frontend con HTML, CSS y JavaScript simple.

## Autenticacion

Las rutas protegidas usan JWT. Primero se debe iniciar sesion y luego enviar el token en el header:

```text
Authorization: Bearer TOKEN
```

## Endpoints principales

### Auth

Registrar usuario:

```http
POST /api/auth/register
```

```json
{
  "nombre": "Usuario Demo",
  "email": "demo@mail.com",
  "password": "123456",
  "rol": "USUARIO"
}
```

Roles permitidos en el registro:

- `USUARIO`: puede comprar, vender, publicar productos y ver sus ordenes.
- `ADMIN`: puede administrar categorias y productos. Para registrarlo se debe enviar `adminCode` con el valor configurado en `ADMIN_REGISTER_CODE`.

Iniciar sesion:

```http
POST /api/auth/login
```

```json
{
  "email": "demo@mail.com",
  "password": "123456"
}
```

### Productos

Listar productos:

```http
GET /api/productos
```

Obtener producto por id:

```http
GET /api/productos/:id
```

Crear producto:

```http
POST /api/productos
```

```json
{
  "categoriaId": 1,
  "titulo": "Teclado mecanico",
  "descripcion": "Teclado compacto con switches mecanicos",
  "imagenUrl": "/product-images/keyboard.svg",
  "precio": 75000,
  "stock": 10
}
```

Actualizar producto:

```http
PUT /api/productos/:id
```

Eliminar producto:

```http
DELETE /api/productos/:id
```

Reponer stock:

```http
PATCH /api/productos/:id/stock
```

```json
{
  "cantidad": 5
}
```

### Categorias

Listar categorias:

```http
GET /api/categorias
```

Obtener categoria por id:

```http
GET /api/categorias/:id
```

Crear categoria:

```http
POST /api/categorias
```

```json
{
  "nombre": "Accesorios"
}
```

Actualizar categoria:

```http
PUT /api/categorias/:id
```

Eliminar categoria:

```http
DELETE /api/categorias/:id
```

### Ordenes

Listar ordenes del usuario:

```http
GET /api/ordenes
```

Comprar producto:

```http
POST /api/ordenes
```

```json
{
  "items": [
    {
      "productoId": 1,
      "cantidad": 2
    },
    {
      "productoId": 2,
      "cantidad": 1
    }
  ]
}
```

## Relaciones principales

- Una categoria tiene muchos productos.
- Un producto pertenece a una categoria.
- Un usuario puede publicar muchos productos.
- Un usuario puede tener muchas ordenes.
- Una orden tiene muchos detalles.
- Un detalle de orden pertenece a un producto.
- Un usuario puede tener muchos roles.

## Manejo de errores

El proyecto utiliza respuestas HTTP con codigos adecuados para errores comunes:

- `400`: datos invalidos.
- `401`: token faltante, invalido o vencido.
- `403`: usuario sin permisos.
- `404`: recurso no encontrado.
- `409`: conflicto, por ejemplo eliminar una categoria con productos activos.
- `500`: error interno del servidor.
