# 🚀 CourtManager — Manual de Implementación y Onboarding (Guía de Puesta en Marcha en 15 Minutos)

> **Documento Oficial de Customer Success para Centros y Complejos Deportivos.**  
> *Versión 2.0 Commercial Edition | Diseñado para Administradores, Gerentes de Operaciones y Dueños de Complejos.*

---

## 1. Introducción y Bienvenida

¡Bienvenido a **CourtManager**! Esta guía práctica está diseñada para que cualquier centro deportivo (*clubes de pádel, canchas de fútbol 5/7, tenis o polideportivos*) configure y comience a operar su plataforma en **menos de 15 minutos**, eliminando cuadernos, chats dispersos y desajustes de caja desde el primer día.

### 📋 Requisitos Previos Necesarios
Antes de iniciar, ten a mano la siguiente información del centro deportivo:
1. **Datos de la Empresa:** RIF/NIT, nombre comercial, dirección física, teléfono de contacto y logotipo en formato PNG o JPG.
2. **Cuentas Bancarias de Cobro:** Datos de Pago Móvil, Cuentas Corrientes (VES), Cuentas Zelle o Banesco Panamá (USD) y política de efectivo.
3. **Catálogo de Canchas:** Nombre de cada cancha, deporte correspondiente, si posee iluminación nocturna y tarifas por hora.
4. **Lista de Inventario Básica (Cantina/Tienda):** Bebidas, hidratantes, pelotas y accesorios con su costo de compra y precio de venta.
5. **Equipo de Recepción:** Nombres y correos electrónicos de los recepcionistas y cajeros que usarán el sistema.

---

## 2. Paso a Paso de Configuración Inicial (15 Minutos)

```
[1. Acceso y Perfil] ➔ [2. Cuentas de Cobro] ➔ [3. Canchas y Precios] ➔ [4. POS e Inventario] ➔ [5. Personal y Roles] ➔ [6. Lanzamiento Web]
```

---

### Paso 1: Primer Acceso y Configuración de Empresa (2 minutos)
1. Ingresa a la URL del panel administrativo (ej. `https://panel.courtmanager.app`).
2. Inicia sesión con las credenciales maestras de SuperAdmin proporcionadas por el equipo de soporte.
3. Dirígete en el menú lateral a **⚙️ Configuración / Ajustes**.
4. Completa la ficha de la empresa:
   - **Razón Social y Nombre Comercial:** Nombre visible para los clientes en el portal web y recibos.
   - **Moneda Base:** Dólar Estadounidense (`USD`).
   - **Moneda Secundaria Local:** Bolívares (`VES`) o Pesos (`COP`).
   - **Tasa de Cambio del Día:** Ingresa el valor oficial del Banco Central. Esta tasa se reflejará inmediatamente en el encabezado del panel y en el checkout del portal web.
5. Haz clic en **Guardar Cambios**.

---

### Paso 2: Cuentas Bancarias y Formas de Pago (3 minutos)
Para que los clientes puedan pagar por autoservicio y los cajeros liquiden turnos en recepción, debes registrar las cuentas receptoras:

1. Ve a **💳 Finanzas ➔ Cuentas de Pago**.
2. Haz clic en **Nueva Cuenta de Pago** y registra cada método disponible:
   - **Pago Móvil (VES):** Banco emisor, número de teléfono asociado, cédula/RIF del titular.
   - **Transferencia Bancaria (VES):** Nombre de banco, tipo de cuenta y número de 20 dígitos.
   - **Zelle / Transferencia Internacional (USD):** Correo electrónico del titular y nombre de la cuenta.
   - **Caja en Efectivo (Dólares y Moneda Local):** Habilitada para pagos directos en mostrador.
3. Selecciona la casilla **"Visible en Portal Público"** para aquellas cuentas donde desees que los jugadores transfieran al reservar por la web.

---

### Paso 3: Alta de Deportes y Canchas (3 minutos)
1. Ve a **🎾 Deportes y Canchas**:
2. Primero, verifica los deportes activos (Pádel, Fútbol Sala, Tenis, etc.). Puedes agregar nuevos con su ícono y reglas.
3. Haz clic en **Nueva Cancha**:
   - **Nombre Identificador:** Ej. *"Cancha 1 — Cristal Panorámica"*, *"Cancha 2 — Fútbol 5 Techado"*.
   - **Deporte Asignado:** Selecciona el deporte correspondiente.
   - **Tipo de Superficie:** Césped sintético, resina, tierra batida o cemento pulido.
   - **Iluminación Nocturna:** Marca la casilla si dispone de reflectores. Permite aplicar un suplemento nocturno si el club lo requiere.
   - **Precio Base por Turno (USD):** Tarifa estándar (ej. `$25.00 / hora` o `$40.00 / hora y media`).
   - **Duración del Bloque:** 60 minutos, 90 minutos o 120 minutos.
   - **Foto de la Cancha:** Sube una fotografía atractiva para exhibir en el portal web de clientes.
4. Repite el proceso para todas las canchas del club.

---

### Paso 4: Carga Inicial de Productos y Margen en Cantina / POS (3 minutos)
CourtManager cuenta con un Punto de Venta (POS) que calcula la ganancia neta en tiempo real:

1. Ve a **🛍️ Inventario / POS ➔ Productos**.
2. Haz clic en **Nuevo Producto**:
   - **Código de Barra / SKU:** Opcional (compatible con lectores láser USB).
   - **Nombre del Producto:** Ej. *"Agua Mineral 500ml"*, *"Gatorade 500ml"*, *"Tubo de Pelotas Pádel Head Pro"*.
   - **Categoría:** Bebidas, Snacks, Accesorios o Alquiler de Palas.
   - **Costo de Compra (USD):** Lo que te cuesta con el proveedor (ej. `$0.60`).
   - **Precio de Venta (USD):** Lo que paga el cliente final (ej. `$1.50`).
   - **Stock Inicial:** Cantidad disponible en nevera o bodega (ej. `48`).
   - **Stock Mínimo de Alerta:** Cantidad de seguridad (ej. `10`). El sistema emitirá una alerta sonora y visual en la campana cuando baje de este umbral.
3. **El sistema calculará automáticamente:**
   $$\text{Ganancia Neta por Unidad} = \$1.50 - \$0.60 = \$0.90$$
   $$\text{Margen Comercial} = \left(\frac{\$0.90}{\$1.50}\right) \times 100 = 60.0\%$$

---

### Paso 5: Creación de Usuarios y Asignación de Roles (2 minutos)
Es fundamental que cada empleado tenga su propio usuario para mantener la bitácora de auditoría inmutable activa:

1. Ve a **👥 Usuarios y Permisos ➔ Nuevo Usuario**.
2. Completa los datos personales (Nombre, Apellido, Correo y Contraseña inicial).
3. Selecciona el **Rol de Acceso**:
   - **👑 Administrador / Gerente:** Acceso ilimitado a finanzas, utilidades netas, configuración general, auditoría y borrado de registros.
   - **🎯 Operador de Recepción / Cajero:** Acceso enfocado al cuadrante de reservas en vivo, cobro de turnos, venta en POS y apertura/cierre de su propia caja. Sin acceso a márgenes globales de la empresa ni a edición de auditoría.
4. Entrega las credenciales al personal de turno.

---

### Paso 6: Lanzamiento y Prueba del Portal Público (2 minutos)
1. Copia el enlace de tu portal web de clientes (ej. `https://reservas.tuclubdeportivo.com` o el subdominio asignado).
2. Abre una ventana de incógnito en tu navegador o en tu teléfono móvil.
3. Simula la experiencia de un cliente:
   - Selecciona fecha y deporte.
   - Escoge un horario libre en una cancha.
   - Elige el método de pago (Pago Móvil / Zelle).
   - Ingresa un número de referencia de prueba.
4. Regresa al **Panel Administrativo**:
   - Observa cómo la campana emite una notificación en tiempo real.
   - La cancha quedará automáticamente bloqueada en el cuadrante, evitando que otra persona la reserve.
   - Abre la reserva, valida el comprobante y márcala como **Confirmada**. El cliente recibirá su correo de confirmación de inmediato.

---

## 3. Operación Diaria: Flujo de Trabajo en Recepción

### 🌅 Al Iniciar el Turno (Apertura de Caja)
1. El recepcionista inicia sesión con su usuario personal.
2. Abre la pestaña **Caja** y registra el fondo inicial en efectivo (ej. `$50.00 USD` y `Bs. 1.500,00`).
3. Revisa la píldora de la **Tasa de Cambio** en el encabezado. Si el Banco Central emitió una nueva tasa oficial, se actualiza en 5 segundos.

### 🎾 Durante el Día (Atención y Turnos)
- **Cliente con Reserva Web:** Ya aparece en verde en el cuadrante con su comprobante adjunto. Solo se verifica su llegada y se le da acceso a la cancha.
- **Cliente en Mostrador (Walk-in):** El recepcionista hace clic en el bloque libre del cuadrante, ingresa nombre/teléfono del jugador, selecciona método de cobro e imprime o envía el recibo digital.
- **Venta de Cantina (POS):** Un jugador pide 2 aguas y 1 gatorade. El recepcionista va a **POS**, toca los productos en pantalla táctil, selecciona si el pago es en dólares, bolívares o a crédito (**Cuentas por Cobrar** si es socio de confianza) y finaliza la venta.

### 🌙 Al Finalizar el Turno (Cierre de Caja y Arqueo)
1. Ve a **Caja ➔ Cierre de Turno**.
2. El sistema muestra el total acumulado separado por método de pago:
   - Total Efectivo USD.
   - Total Efectivo Moneda Local (Bs).
   - Total Pago Móvil y Transferencias Bancarias conciliadas.
   - Total Zelle.
3. El cajero ingresa el conteo físico del dinero en gaveta.
4. El sistema emite el reporte de **Arqueo y Descuadre (Diferencia)**, dejándolo guardado con firma digital para la revisión de gerencia.

---

## 4. Consulta de Reportes y Ganancia Neta para la Gerencia

CourtManager elimina las conjeturas financieras mediante reportes de rendimiento y rentabilidad:

1. Ve a **📈 Reportes Financieros (P&L)**.
2. Filtra por el período deseado: **Hoy**, **Últimos 7 Días**, **Este Mes** o **Rango Personalizado**.
3. Revisa las 4 métricas críticas de salud del negocio:
   - **Ingresos Totales:** Suma de alquiler de canchas + ventas de mostrador.
   - **Costo de Ventas (COGS):** Lo que costó comprar los productos consumidos en el período.
   - **Ganancia Neta Real:** Ingreso Total menos el Costo de los productos vendidos.
   - **Margen Comercial %:** Porcentaje real de rendimiento sobre las ventas generadas.
4. Descarga o imprime el informe en **PDF con 1 solo clic** para reuniones de socios o auditoría contable.

---

## 5. Matriz de Soporte y Solución de Dudas Frecuentes

| Situación Común | Causa Probable | Solución Rápida |
| :--- | :--- | :--- |
| Un turno aparece bloqueado pero el cliente no pagó | La reserva web se quedó en estado *Pendiente de Validación* | Abre el cuadrante, haz clic en la reserva y selecciona *Rechazar / Liberar Turno*. El horario vuelve a estar disponible al instante. |
| El cajero no puede ver las ganancias del mes | El rol asignado es *Operador de Recepción* | Por seguridad empresarial, los márgenes netos solo son visibles para usuarios con rol *Administrador*. |
| El monto en Bolívares difiere del esperado | La tasa de cambio guardada no está actualizada | Haz clic en la píldora de tasa en el encabezado, presiona *Actualizar Tasa*, coloca el nuevo valor y el sistema recalcula todos los saldos en vivo. |
| La campana de notificaciones no suena | Permisos de audio bloqueados en el navegador | Haz clic en el ícono de candado en la barra de URL del navegador y cambia el permiso de *Sonido* a *Permitir*. |

---

## 6. Lista de Verificación Final (Checklist de Salida a Producción)

Marca cada casilla para garantizar que el centro deportivo está 100% listo para operar:

- [ ] Datos fiscales, dirección y logo del complejo cargados.
- [ ] Tasa de cambio oficial del día establecida en el sistema.
- [ ] Al menos 1 método de pago en Bolívares (Pago Móvil / Transferencia) activo.
- [ ] Al menos 1 método de pago en Dólares (Zelle / Efectivo) activo.
- [ ] Todas las canchas creadas con tarifas y horarios correctos.
- [ ] Neveras y vitrinas cargadas en el POS con costo y precio de venta.
- [ ] Usuarios de recepcionistas y cajeros creados con contraseñas seguras.
- [ ] Notificaciones de audio probadas en el equipo de recepción.
- [ ] Una reserva de prueba realizada exitosamente desde un teléfono móvil.
- [ ] Código QR con el enlace de reservas web impreso y visible en el mostrador del club.
