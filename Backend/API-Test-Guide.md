# Guía de Pruebas API - Gestor de Canchas Deportivas

## 1. Configuración Inicial

### Variables de entorno
Define estas variables en Postman o Thunder Client:

- `baseURL`: `http://localhost:3000/api`
- `token`: `{{token}}` (se rellena después de login)

### Autenticación inicial
1. Ejecuta `POST {{baseURL}}/auth/login`
2. En el body envía:
   ```json
   {
     "username": "admin",
     "password": "12345"
   }
   ```
3. Espera un `token` en la respuesta.
4. Guarda el token en la variable `token`.
5. Usa el header `Authorization: Bearer {{token}}` en todas las rutas protegidas.

> Nota: también puedes registrar un usuario con `/auth/register` si la ruta está habilitada.

## 2. Colección de Pruebas Organizada por Carpetas

### Autenticación

#### POST /auth/login
- URL: `{{baseURL}}/auth/login`
- Método: `POST`
- Headers:
  - `Content-Type: application/json`
- Body:
  ```json
  {
    "username": "admin",
    "password": "12345"
  }
  ```
- Respuesta esperada:
  - `200 OK`
  - Ejemplo:
    ```json
    {
      "user": {
        "id": 1,
        "username": "admin",
        "full_name": "Administrador",
        "email": "admin@example.com",
        "role_id": 1,
        "status": "Activated"
      },
      "token": "eyJhbGciOi..."
    }
    ```
- Notas:
  - Guarda el `token` en la variable de entorno.
  - Si falta `username` o `password` devuelve `400`.
  - Si las credenciales son inválidas devuelve `401`.

#### POST /auth/register
- URL: `{{baseURL}}/auth/register`
- Método: `POST`
- Headers:
  - `Content-Type: application/json`
- Body:
  ```json
  {
    "username": "tc_user",
    "password": "password123",
    "full_name": "Test Client",
    "email": "test.client@example.com",
    "role_id": 2,
    "status": "Activated"
  }
  ```
- Respuesta esperada:
  - `201 Created`
  - Ejemplo:
    ```json
    {
      "user": { ... },
      "token": "..."
    }
    ```
- Notas:
  - Registra un nuevo usuario.
  - Si el usuario o correo ya existen devuelve `409`.

### Usuarios

#### GET /users
- URL: `{{baseURL}}/users`
- Método: `GET`
- Headers:
  - `Authorization: Bearer {{token}}`
- Respuesta esperada:
  - `200 OK`
  - Ejemplo:
    ```json
    [
      {
        "id": 1,
        "username": "admin",
        "full_name": "Administrador",
        "email": "admin@example.com",
        "role_id": 1,
        "status": "Activated"
      }
    ]
    ```
- Notas: requiere token válido.

#### GET /users/:id
- URL: `{{baseURL}}/users/1`
- Método: `GET`
- Headers:
  - `Authorization: Bearer {{token}}`
- Respuesta esperada:
  - `200 OK`
  - Ejemplo:
    ```json
    {
      "id": 1,
      "username": "admin",
      "full_name": "Administrador",
      "email": "admin@example.com",
      "role_id": 1,
      "status": "Activated"
    }
    ```
- Notas: si el usuario no existe devuelve `404`.

#### POST /users
- URL: `{{baseURL}}/users`
- Método: `POST`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- Body:
  ```json
  {
    "username": "new_user",
    "password": "password123",
    "full_name": "New User",
    "email": "new.user@example.com",
    "role_id": 2,
    "status": "Activated"
  }
  ```
- Respuesta esperada:
  - `201 Created`
  - Ejemplo:
    ```json
    {
      "id": 2,
      "username": "new_user",
      "full_name": "New User",
      "email": "new.user@example.com",
      "role_id": 2,
      "status": "Activated"
    }
    ```
- Notas: la contraseña se guarda hasheada. Si faltan campos devuelve `400`.

#### PUT /users/:id
- URL: `{{baseURL}}/users/1`
- Método: `PUT`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- Body ejemplo:
  ```json
  {
    "email": "updated.user@example.com",
    "password": "newpassword123"
  }
  ```
- Respuesta esperada:
  - `200 OK`
  - Ejemplo:
    ```json
    {
      "id": 1,
      "username": "admin",
      "email": "updated.user@example.com",
      "role_id": 1,
      "status": "Activated"
    }
    ```
- Notas: la contraseña también se actualiza hasheada.

#### DELETE /users/:id
- URL: `{{baseURL}}/users/1`
- Método: `DELETE`
- Headers:
  - `Authorization: Bearer {{token}}`
- Respuesta esperada:
  - `200 OK`
  - Ejemplo:
    ```json
    { "message": "Usuario eliminado correctamente" }
    ```

### Clientes

#### GET /customers
- URL: `{{baseURL}}/customers`
- Método: `GET`
- Headers:
  - `Authorization: Bearer {{token}}`
- Respuesta esperada: `200 OK`
- Ejemplo:
  ```json
  [
    {
      "id": 1,
      "tax_id": "12345678",
      "full_name": "Cliente Prueba",
      "phone_number": "+541112345678"
    }
  ]
  ```

#### GET /customers/:id
- URL: `{{baseURL}}/customers/1`
- Método: `GET`
- Headers:
  - `Authorization: Bearer {{token}}`
- Notas: devuelve `404` si no existe.

#### POST /customers
- URL: `{{baseURL}}/customers`
- Método: `POST`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- Body ejemplo:
  ```json
  {
    "tax_id": "12345678",
    "full_name": "Cliente Prueba",
    "phone_number": "+541112345678",
    "member_since": "2024-01-01",
    "credit_limit": 1000.0,
    "outstanding_balance": 0.0
  }
  ```

#### PUT /customers/:id
- URL: `{{baseURL}}/customers/1`
- Método: `PUT`
- Header: `Authorization`
- Body ejemplo:
  ```json
  {
    "phone_number": "+541198765432",
    "credit_limit": 1500.0
  }
  ```

#### DELETE /customers/:id
- URL: `{{baseURL}}/customers/1`
- Método: `DELETE`
- Header: `Authorization`

### Canchas

#### GET /courts
- URL: `{{baseURL}}/courts`
- Método: `GET`
- Header: `Authorization`

#### GET /courts/:id
- URL: `{{baseURL}}/courts/1`
- Método: `GET`
- Header: `Authorization`

#### POST /courts
- URL: `{{baseURL}}/courts`
- Método: `POST`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- Body ejemplo:
  ```json
  {
    "court_name": "Cancha Central",
    "sport_type": "Futbol",
    "hourly_rate": 1200.0,
    "status": "Available"
  }
  ```

#### PUT /courts/:id
- URL: `{{baseURL}}/courts/1`
- Método: `PUT`
- Body ejemplo:
  ```json
  {
    "status": "Maintenance",
    "hourly_rate": 1300.0
  }
  ```

#### DELETE /courts/:id
- URL: `{{baseURL}}/courts/1`
- Método: `DELETE`

> Nota: la ruta `GET /courts/available` no está implementada en el backend actual.

### Reservas

#### GET /bookings
- URL: `{{baseURL}}/bookings`
- Método: `GET`
- Header: `Authorization`

#### GET /bookings/:id
- URL: `{{baseURL}}/bookings/1`
- Método: `GET`
- Header: `Authorization`

#### POST /bookings
- URL: `{{baseURL}}/bookings`
- Método: `POST`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- Body ejemplo:
  ```json
  {
    "customer_id": 1,
    "court_id": 1,
    "user_id": 1,
    "booking_date": "2025-01-15",
    "start_time": "10:00:00",
    "end_time": "11:00:00",
    "total_amount": 1200.0,
    "payment_status": "Pending"
  }
  ```

#### PUT /bookings/:id
- URL: `{{baseURL}}/bookings/1`
- Método: `PUT`
- Body ejemplo:
  ```json
  {
    "payment_status": "Paid"
  }
  ```

#### DELETE /bookings/:id
- URL: `{{baseURL}}/bookings/1`
- Método: `DELETE`

> Nota: la ruta `GET /bookings/by-date/:date` no está implementada en el backend actual.

### Facturación

#### GET /billings
- URL: `{{baseURL}}/billings`
- Método: `GET`
- Header: `Authorization`

#### GET /billings/:id
- URL: `{{baseURL}}/billings/1`
- Método: `GET`
- Header: `Authorization`

#### POST /billings
- URL: `{{baseURL}}/billings`
- Método: `POST`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- Body ejemplo:
  ```json
  {
    "customer_id": 1,
    "user_id": 1,
    "booking_id": 1,
    "payment_method_id": 1,
    "total_paid": 1200.0,
    "payment_status": "Paid"
  }
  ```

#### PUT /billings/:id
- URL: `{{baseURL}}/billings/1`
- Método: `PUT`
- Body ejemplo:
  ```json
  {
    "payment_status": "Pending"
  }
  ```

### Productos

#### GET /products
- URL: `{{baseURL}}/products`
- Método: `GET`
- Header: `Authorization`

#### GET /products/:id
- URL: `{{baseURL}}/products/1`
- Método: `GET`
- Header: `Authorization`

#### POST /products
- URL: `{{baseURL}}/products`
- Método: `POST`
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer {{token}}`
- Body ejemplo:
  ```json
  {
    "product_name": "Pelota Oficial",
    "current_stock": 10,
    "sale_price": 2500.0,
    "purcharse_price": 1800.0
  }
  ```

#### PUT /products/:id
- URL: `{{baseURL}}/products/1`
- Método: `PUT`
- Body ejemplo:
  ```json
  {
    "current_stock": 15,
    "sale_price": 2600.0
  }
  ```

#### DELETE /products/:id
- URL: `{{baseURL}}/products/1`
- Método: `DELETE`

## 3. Detalle de pruebas para cada solicitud

Para todas las solicitudes protegidas, agrega el header:
- `Authorization: Bearer {{token}}`

Para todas las solicitudes con cuerpo JSON:
- `Content-Type: application/json`

### Respuestas esperadas típicas
- `200 OK` → recurso leído o modificado correctamente
- `201 Created` → recurso creado
- `400 Bad Request` → validación de datos falló
- `401 Unauthorized` → token faltante o inválido
- `403 Forbidden` → token válido pero permiso denegado
- `404 Not Found` → recurso no existe

## 4. Casos de Prueba Especiales

### Autenticación
- Login con token válido → `200`
- Login con password incorrecto → `401`
- Login sin campos obligatorios → `400`
- Petición a `/users` sin token → `401`
- Petición a `/users` con token inválido → `403`

### Validación
- Crear usuario sin `password` → `400`
- Crear cliente sin `tax_id` → `400`
- Crear cancha con `hourly_rate` negativo → `400`
- Crear reserva con formato incorrecto de `booking_date` o `start_time` → `400`

### Errores de recurso
- `GET /users/9999` → `404`
- `DELETE /customers/9999` → `404`
- `PUT /billings/9999` → `404`

## 5. Flujos de Prueba Complejos

### Flujo completo de reserva
1. Autenticar con `POST /auth/login`
2. Crear un cliente con `POST /customers`
3. Verificar canchas existentes con `GET /courts`
4. Crear reserva con `POST /bookings`
5. Generar factura con `POST /billings`

### Flujo completo de venta
1. Autenticar con `POST /auth/login`
2. Verificar productos con `GET /products`
3. Crear producto nuevo si es necesario con `POST /products`
4. Crear factura con `POST /billings`
5. Registrar detalles de venta en la DB (actualmente el endpoint de detalles de venta está disponible en el backend, pero no forma parte de esta guía solicitada)

## 6. Archivos de importación
Importa estos archivos en Postman o Thunder Client:
- `API-Test-Collection.postman_collection.json`
- `API-Test-Environment.postman_environment.json`

## 7. Observaciones
- El backend actual no implementa `GET /courts/available` ni `GET /bookings/by-date/:date`.
- Todas las rutas protegidas usan `Authorization: Bearer {{token}}`.
- Asegúrate de ejecutar el servidor en `http://localhost:3000` antes de probar.
