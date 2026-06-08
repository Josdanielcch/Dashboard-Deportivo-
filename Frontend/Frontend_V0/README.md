# CourtManager - Sistema de Gestión de Canchas Deportivas

Un dashboard profesional y completo para la gestión de complejos de alquiler de canchas deportivas, construido con Next.js, React y TailwindCSS.

## 🎨 Diseño y Colores

El proyecto utiliza la paleta de colores inspirada en **CourtConnect**:
- **Verde Neón**: #CCFF00 (color primario y de acentos)
- **Negro Oscuro**: #0a0e27 (fondo principal)
- **Azul Oscuro**: #0f1533 (tarjetas y componentes secundarios)
- **Blanco**: #ffffff (texto principal)

## 📊 Módulos del Sistema

### 1. **Dashboard**
Vista general del complejo con:
- Estadísticas en tiempo real (Reservas, Ingresos, Clientes, Ocupación)
- Gráficos de reservas por deporte
- Ingresos de los últimos 7 días
- Tabla de últimas reservas

### 2. **Canchas**
Gestión completa del catálogo de canchas:
- Grid de tarjetas para cada cancha
- Información de deporte, superficie y tarifa
- Estado de disponibilidad
- Botones para editar y eliminar

### 3. **Reservas**
Administración de todas las reservas:
- Tabla interactiva con búsqueda
- Estados: Confirmada, Pendiente, Cancelada
- Información de cliente, cancha y duración
- Gestión de cambios y cancelaciones

### 4. **Clientes**
Base de datos de clientes:
- Listado completo con contacto
- Historial de reservas por cliente
- Información de ubicación
- Contacto directo (email y teléfono)

### 5. **Productos**
Tienda de artículos deportivos:
- Catálogo de productos
- SKU y categorías
- Control de inventario
- Precios y disponibilidad

### 6. **Ventas**
Seguimiento de ventas:
- Estadísticas de ventas diarias y mensuales
- Tabla de transacciones
- Cliente y producto vendido
- Estados de pago

### 7. **Usuarios**
Gestión del equipo:
- Usuarios del sistema
- Roles y permisos
- Estado de activación
- Fecha de registro

### 8. **Auditoría**
Registro de actividades:
- Log de todas las acciones del sistema
- Usuario, acción y entidad afectada
- Timestamp e IP
- Búsqueda y filtrado

## 🚀 Características Destacadas

✅ **Interfaz Moderna**: Diseño limpio y profesional con tema oscuro  
✅ **Navegación Intuitiva**: Sidebar persistente con acceso a todos los módulos  
✅ **Componentes Reutilizables**: Código modular y escalable  
✅ **Responsive Design**: Funciona perfectamente en dispositivos móviles y desktop  
✅ **Color System**: Paleta de colores profesional y consistente  
✅ **Datos Simulados**: Ejemplos de datos para demostración  

## 🛠️ Tecnologías Utilizadas

- **Next.js 16** - Framework React con Server Components
- **React 19** - Librería UI
- **TailwindCSS** - Estilos y diseño responsive
- **Lucide Icons** - Iconografía moderna
- **TypeScript** - Tipado seguro

## 📦 Estructura del Proyecto

```
app/
├── layout.tsx           # Layout raíz con metadatos
├── globals.css          # Temas y variables de diseño
└── page.tsx             # Componente principal del dashboard

components/
├── sidebar.tsx          # Navegación lateral
├── dashboard-view.tsx   # Vista del dashboard
├── canchas-view.tsx     # Módulo de canchas
├── reservas-view.tsx    # Módulo de reservas
├── clientes-view.tsx    # Módulo de clientes
├── productos-view.tsx   # Módulo de productos
├── ventas-view.tsx      # Módulo de ventas
├── usuarios-view.tsx    # Módulo de usuarios
└── auditoria-view.tsx   # Módulo de auditoría
```

## 🎯 Próximos Pasos

Este es un dashboard demo con datos simulados. Para producción, puedes:

1. **Integrar Base de Datos**: Conectar con Neon, Supabase o tu BD preferida
2. **Autenticación**: Implementar login con Better Auth o Supabase Auth
3. **API Endpoints**: Crear rutas API para CRUD de cada módulo
4. **Validación de Datos**: Agregar esquemas con Zod o similar
5. **Reportes PDF**: Exportar reportes y estadísticas
6. **Notificaciones**: Sistema de alertas y notificaciones

## 📝 Licencia

Este proyecto es de uso libre. ¡Personalízalo según tus necesidades!
