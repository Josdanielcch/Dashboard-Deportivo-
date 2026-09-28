# 🔌 CourtManager — Guía de Integración y Referencia de la API REST & WebSockets

> **Especificación Técnica Oficial para Integraciones de Software, Bots, Apps Móviles y ERPs Contables.**  
> *Versión 2.0 Commercial Edition | Formato RESTful JSON + Eventos de Sockets en Tiempo Real.*

---

## 1. Convenciones y Fundamentos de la API

La API de **CourtManager** es una interfaz RESTful que utiliza HTTPS, métodos estándar (GET, POST, PUT, PATCH, DELETE) y representación de datos exclusivamente en JSON.

### 1.1. URL Base
- **Producción:** `https://api.courtmanager.app/api`
- **Desarrollo Local:** `http://localhost:3000/api`

### 1.2. Envoltorio Estándar de Respuesta (Standard Response Envelope)
Todas las respuestas de la API siguen una estructura predecible:

**Respuesta Exitosa (HTTP 200 / 201):**
```json
{
  "success": true,
  "data": { ... }
}
```

**Respuesta de Error (HTTP 4xx / 5xx):**
```json
{
  "success": false,
  "error": "Mensaje descriptivo del error para el cliente",
  "details": []
}
```

### 1.3. Códigos de Estado HTTP
| Código | Significado | Descripción |
| :--- | :--- | :--- |
| `200 OK` | Petición exitosa | Consulta o actualización procesada correctamente. |
| `201 Created` | Recurso creado | Nueva reserva, usuario, producto o pago registrado. |
| `400 Bad Request` | Parámetros inválidos | Faltan campos requeridos o el formato no cumple las reglas. |
| `401 Unauthorized` | No autenticado | Token ausente, caducado o con firma inválida. |
| `403 Forbidden` | Acceso denegado | El rol del usuario no tiene permisos para esta acción. |
| `409 Conflict` | Conflicto de datos | Solapamiento de horario (cancha ya reservada por otro cliente). |
| `429 Too Many Requests` | Límite excedido | Se superó la cuota de peticiones permitidas por minuto (Rate Limit). |
| `500 Server Error` | Error de servidor | Incidencia no controlada en la infraestructura. |

---

## 2. Autenticación y Seguridad

Todas las rutas privadas requieren el envío de un **JSON Web Token (JWT)** en la cabecera HTTP `Authorization`:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## 3. Catálogo de Endpoints Principales

### 3.1. Autenticación
#### `POST /auth/login`
Inicia sesión y genera el token de acceso.
- **Payload:**
```json
{
  "email": "admin@clubdeportivo.com",
  "password": "PasswordSegura123!"
}
```
- **Respuesta (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUz...",
    "user": {
      "id": 1,
      "name": "Carlos Rodríguez",
      "email": "admin@clubdeportivo.com",
      "role": "admin"
    }
  }
}
```

---

### 3.2. Canchas y Disponibilidad
#### `GET /courts`
Retorna el catálogo de canchas con sus características, deporte y tarifas.
- **Query Params:** `?sport_id=1&active=true`
- **Respuesta (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Cancha 1 — Cristal Panorámica",
      "sport": "Pádel",
      "price_per_hour": 30.00,
      "has_lighting": true,
      "surface": "Césped Sintético",
      "is_active": true
    }
  ]
}
```

---

### 3.3. Reservas y Cuadrante de Turnos
#### `GET /bookings`
Obtiene las reservas registradas filtradas por fecha o cancha.
- **Query Params:** `?date=2026-09-28&court_id=1`

#### `POST /bookings`
Crea una nueva reserva con bloqueo transaccional atómico contra colisiones.
- **Payload:**
```json
{
  "court_id": 1,
  "customer_name": "Alejandro Pérez",
  "customer_phone": "+584121234567",
  "customer_email": "alejandro@email.com",
  "booking_date": "2026-09-28",
  "start_time": "18:00:00",
  "end_time": "19:30:00",
  "payment_method": "pago_movil",
  "payment_reference": "REF-984214",
  "total_amount_usd": 45.00
}
```
- **Respuesta (201 Created):**
```json
{
  "success": true,
  "data": {
    "booking_id": 1042,
    "status": "pending_validation",
    "message": "Reserva creada exitosamente y turno bloqueado en tiempo real."
  }
}
```

#### `PATCH /bookings/:id/status`
Cambia el estado de una reserva (*confirmed*, *completed*, *cancelled*).
- **Payload:**
```json
{
  "status": "confirmed",
  "notes": "Pago móvil verificado en banco emisor."
}
```

---

### 3.4. Punto de Venta (POS) e Inventario
#### `GET /products`
Listado de productos con stock, costo y margen de ganancia calculado.
- **Respuesta (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "barcode": "7591234567890",
      "name": "Gatorade Cool Blue 500ml",
      "cost_price": 0.80,
      "sale_price": 2.00,
      "net_profit": 1.20,
      "margin_percentage": 60.0,
      "stock": 36,
      "min_stock": 10
    }
  ]
}
```

#### `POST /billings`
Registra una venta en el POS, descuenta existencias y genera la factura.
- **Payload:**
```json
{
  "customer_id": 4,
  "payment_method": "efectivo_usd",
  "currency": "USD",
  "items": [
    { "product_id": 12, "quantity": 2, "unit_price": 2.00 }
  ],
  "total_usd": 4.00
}
```

---

### 3.5. Motor Multimoneda y Tasas de Cambio
#### `GET /exchange-rates/latest`
Consulta la tasa referencial activa utilizada en todas las conversiones.
- **Respuesta (200 OK):**
```json
{
  "success": true,
  "data": {
    "base_currency": "USD",
    "target_currency": "VES",
    "rate": 852.41,
    "source": "BCV Oficial",
    "updated_at": "2026-09-28T09:00:00Z"
  }
}
```

#### `POST /exchange-rates` *(Solo Administrador)*
Actualiza la tasa del día y emite un evento en tiempo real a todas las pantallas.
- **Payload:**
```json
{
  "rate": 855.20,
  "source": "BCV Cierre Diario"
}
```

---

### 3.6. Reportes Financieros y Rentabilidad (P&L)
#### `GET /reports/pnl`
Retorna el desglose de ingresos por cancha vs. productos, costo de ventas y margen neto.
- **Query Params:** `?start_date=2026-09-01&end_date=2026-09-28`
- **Respuesta (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": { "start": "2026-09-01", "end": "2026-09-28" },
    "court_revenue_usd": 3850.00,
    "product_revenue_usd": 1420.00,
    "total_revenue_usd": 5270.00,
    "cost_of_goods_sold_usd": 568.00,
    "net_profit_usd": 4702.00,
    "profit_margin_pct": 89.22
  }
}
```

---

## 4. WebSockets y Eventos en Tiempo Real (Socket.IO)

CourtManager expone un servidor Socket.IO para sincronizar interfaces en milisegundos sin necesidad de hacer polling HTTP.

### 4.1. Conexión del Cliente
```javascript
import { io } from 'socket.io-client';

const socket = io('https://api.courtmanager.app', {
  transports: ['websocket'],
  withCredentials: true
});

// Unirse a la sala administrativa
socket.emit('join-dashboard');
```

### 4.2. Catálogo de Eventos Emitidos por el Servidor
| Evento | Payload | Descripción |
| :--- | :--- | :--- |
| `booking:created` | `{ booking_id, court_id, start_time, total_amount }` | Se emite al generarse una reserva. Bloquea el turno en vivo. |
| `booking:status_changed` | `{ booking_id, new_status }` | Notifica cuando una reserva pasa de pendiente a confirmada o cancelada. |
| `product:low_stock` | `{ product_id, name, current_stock, min_stock }` | Dispara alerta sonora en la campana de recepción si un producto se agota. |
| `exchange_rate:updated` | `{ new_rate, updated_at }` | Actualiza la píldora de tasa de cambio en la barra superior al instante. |

---

## 5. Ejemplos de Implementación

### Ejemplo en Python (Para Bot de WhatsApp o Sistema Externo)
```python
import requests

API_URL = "https://api.courtmanager.app/api"
TOKEN = "TU_TOKEN_JWT_AQUI"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Consultar canchas libres
response = requests.get(f"{API_URL}/courts?active=true", headers=headers)
canchas = response.json().get("data", [])

for c in canchas:
    print(f"Cancha: {c['name']} - Tarifa: ${c['price_per_hour']}/h")
```
