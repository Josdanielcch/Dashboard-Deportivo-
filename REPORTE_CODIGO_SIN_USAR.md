# 📋 Reporte de Código Sin Usar (Dead Code)

**Proyecto:** CourtConnect — Sistema de gestión de canchas deportivas
**Fecha de análisis:** 20 de agosto de 2026
**Alcance:** Frontend (React + Vite) y Backend (Node.js + Express)
**Método:** Análisis estático del grafo de importaciones + verificación manual con búsquedas exhaustivas (grep) de cada símbolo reportado.

---

## Índice

1. [¿Qué es el "código sin usar" y por qué importa?](#1-qué-es-el-código-sin-usar-y-por-qué-importa)
2. [¿Cómo se hizo este análisis?](#2-cómo-se-hizo-este-análisis)
3. [Resumen ejecutivo](#3-resumen-ejecutivo)
4. [Hallazgos del FRONTEND](#4-hallazgos-del-frontend)
   - 4.1 Archivos completos sin usar
   - 4.2 Funciones de servicios sin usar
   - 4.3 Imágenes y assets sin usar
   - 4.4 Dependencias npm sin usar
   - 4.5 Hallazgos menores
5. [Hallazgos del BACKEND](#5-hallazgos-del-backend)
   - 5.1 Archivos completos sin usar
   - 5.2 Exportaciones sin usar
   - 5.3 Dependencias npm sin usar
   - 5.4 Scripts rotos (crashean al ejecutarlos)
   - 5.5 Scripts de migración one-off (ya ejecutados)
6. [Hallazgos que NO son código muerto pero conviene revisar](#6-hallazgos-que-no-son-código-muerto-pero-conviene-revisar)
7. [Plan de limpieza recomendado por niveles de riesgo](#7-plan-de-limpieza-recomendado-por-niveles-de-riesgo)

---

## 1. ¿Qué es el "código sin usar" y por qué importa?

Se llama **código muerto (dead code)** a todo archivo, función, variable o recurso que existe en el proyecto pero **nunca se ejecuta ni se referencia** desde el punto de entrada de la aplicación. Es como una habitación llena de muebles que nadie usa: ocupa espacio, dificulta el mantenimiento y puede confundir a nuevos desarrolladores ("¿esto se usa o no?").

**Beneficios de eliminarlo:**
- ✅ El proyecto es más fácil de entender y mantener.
- ✅ Menos archivos = menos código que leer, documentar y probar.
- ✅ Instalaciones más rápidas (menos dependencias npm que descargar).
- ✅ Menor riesgo de bugs: el código muerto a veces se "reactiva" por accidente y falla porque quedó desactualizado.

---

## 2. ¿Cómo se hizo este análisis?

Para afirmar que algo **no se usa**, no basta con buscarlo a simple vista. Se siguió este procedimiento:

1. **Grafo de dependencias:** Se partió del punto de entrada de cada aplicación:
   - *Frontend:* `index.html` → `main.jsx` → `App.jsx` → componentes.
   - *Backend:* `server.js` → `app.js` → rutas → controladores.
   
   Todo lo que no es alcanzable desde ahí mediante cadenas de `import`/`require` es inalcanzable en tiempo de ejecución.

2. **Búsqueda exhaustiva (grep):** Cada archivo y función sospechosa se buscó por su nombre en **todo el proyecto**, incluyendo tests, scripts, configuración y documentación, para descartar usos dinámicos o referencias ocultas.

3. **Verificación cruzada:** Se comparó lo que exporta cada módulo contra lo que realmente importan los demás archivos, uno por uno.

> ⚠️ **Nota importante:** Los casos marcados como "ambiguos" (por ejemplo, imágenes cuya ruta se guarda en la base de datos) **no** fueron clasificados como muertos, porque aunque el código no los menciona textualmente, sí podrían usarse en tiempo de ejecución.

---

## 3. Resumen ejecutivo

| Categoría | Cantidad | Impacto |
|---|---|---|
| Archivos frontend completos sin usar | 4 | ~200 líneas + CSS residual |
| Métodos de servicios frontend sin llamador | 19 | Código inflado |
| Assets (imágenes) sin usar | ~11 | Peso innecesario en el repositorio |
| Dependencias npm frontend removibles | 2–4 | Instalación más liviana |
| Archivos backend completos sin usar | 4 | ~400 líneas |
| Dependencias npm backend sin usar | 3 (`joi`, `pg-pool`, `google-auth-library`) | Instalación más liviana |
| Scripts backend rotos | 3 | Crashean si alguien los ejecuta |
| Scripts one-off archivables | ~10 | Ruido en el repositorio |

---

## 4. Hallazgos del FRONTEND

### 4.1 Archivos completos sin usar

Estos archivos existen en el proyecto pero **ningún otro archivo los importa**. Si se borraran hoy, la aplicación funcionaría exactamente igual.

#### 🔴 `src/components/ui/button.tsx`
- **Qué es:** Un componente de botón reutilizable con variantes visuales (estilo shadcn/ui), probablemente agregado al inicio del proyecto con intención de usarlo.
- **Evidencia:** Búsqueda de `ui/button` en todo `src/` → cero resultados. Las vistas construyen sus propios botones con clases de Tailwind directamente.
- **Recomendación:** Eliminar. Si algún día se quiere un sistema de botones unificado, se puede recuperar del historial de git.

#### 🔴 `src/services/statsService.js`
- **Qué es:** Servicio que consumía estadísticas (probablemente `GET /api/stats`).
- **Evidencia:** Ningún componente lo importa. El dashboard usa `dashboardService.getStats` (que apunta a `/api/dashboard/stats`, la ruta realmente montada en el backend).
- **Dato curioso:** Este archivo es el "gemelo frontend" del `statsController.js` huérfano del backend (ver sección 5.1): ambos parecen restos de una versión anterior de la API de estadísticas que fue reemplazada por `/api/dashboard`.

#### 🔴 `src/App.css`
- **Qué es:** La hoja de estilos que crea Vite por defecto al iniciar un proyecto (contiene reglas como `.hero`, `.counter`, `#next-steps`).
- **Evidencia:** No se importa ni en `main.jsx`, ni en `App.jsx`, ni en ningún otro archivo. El estilo real vive en `index.css`.
- **Recomendación:** Eliminar sin riesgo.

#### 🔴 `src/lib/utils.ts`
- **Qué es:** Contiene la función `cn()` (combina clases de Tailwind), utilidad típica de shadcn/ui.
- **Evidencia:** Su único consumidor era `ui/button.tsx`… que a su vez está muerto. Es un caso de **muerte en cadena**: al borrar el padre, el hijo queda huérfano.
- **Recomendación:** Eliminar junto con `button.tsx`.

### 4.2 Funciones de servicios sin usar

Los archivos de `src/services/*.js` son la capa que habla con la API del backend. Muchos definen métodos "por completitud" (getById, delete, etc.) que las vistas nunca terminaron usando. **No hay nada roto aquí**: simplemente son funciones exportadas que nadie llama.

| Servicio | Método sin usar | Línea | Explicación |
|---|---|---|---|
| `authService.js` | `register` | 36 | El registro de usuarios se hace desde el panel admin (`userService.create`), no por autoregistro público. |
| `auditService.js` | `getByRecord` | 34 | La vista de auditoría solo lista logs generales; nunca filtra por registro específico. |
| `bookingService.js` | `getByDate` | 20 | El calendario de reservas obtiene todo con `getAll` y filtra en el cliente. |
| `bookingService.js` | `checkAvailability` | 33 | La disponibilidad se valida en el backend al crear la reserva; el frontend no pre-consulta. |
| `bookingService.js` | `getCustomerBookings` | 83 | No existe vista "mis reservas" para clientes. |
| `courtService.js` | `getById` | 20 | Las canchas se listan completas; nunca se pide una individual. |
| `courtService.js` | `updateStatus` | 50 | El estado de la cancha se cambia dentro de `update` general. |
| `customerService.js` | `search` | 20 | La búsqueda de clientes se hace filtrando la lista completa en memoria. |
| `customerService.js` | `getById` | 29 | Ídem patrón getById sin uso. |
| `customerService.js` | `recordPayment` | 62 | Los pagos de clientes se registran vía `cxcService.createPayment`. |
| `cxcService.js` | `getByCustomer` | 7 | Las cuentas por cobrar se muestran todas juntas, sin filtro por cliente. |
| `cxpService.js` | `getById` | 7 | Ídem patrón getById. |
| `productService.js` | `getById` | 20 | Ídem patrón getById. |
| `productService.js` | `updateStock` | 52 | El stock se ajusta automáticamente al registrar compras; no hay ajuste manual. |
| `supplierService.js` | `getById` | 7 | Ídem patrón getById. |
| `userService.js` | `getById` | 21 | Ídem patrón getById. |
| `userService.js` | `updateStatus` | 55 | El estado del usuario se cambia con `update` general. |
| `userService.js` | `delete` | 64 | ⚠️ Interesante: **no existe forma de eliminar usuarios desde la UI**; solo se desactivan. Confirmar si es decisión de diseño antes de borrar. |

**Recomendación:** Son seguras de eliminar, pero como son la "API pública" hacia el backend, otra opción es conservarlas como documentación de endpoints disponibles. Decisión de equipo.

### 4.3 Imágenes y assets sin usar

#### Sin ninguna referencia en el código (eliminables):

| Asset | Qué era probablemente |
|---|---|
| `src/assets/hero.png` | Imagen hero de una landing page anterior |
| `src/assets/react.svg` y `src/assets/vite.svg` | Logos de la plantilla inicial de Vite |
| `public/icons.svg` | Sprite de iconos reemplazado por `lucide-react` |
| `public/images/ad-protip.jpg` | Imagen promocional de plantilla |
| `public/images/avatar-1.jpg`, `-2.jpg`, `-3.jpg` | Avatares de demostración. Los avatares reales se cargan desde el backend (`uploads/avatars/`) |
| `public/images/court-1.jpg` … `court-5.jpg`, `court-8.jpg` | Fotos de canchas de demostración |

#### ⚠️ Caso especial — NO eliminar sin verificar:

Las imágenes `public/images/sport-basquet.jpg`, `sport-futbol.jpg`, `sport-padel.jpg` y `sport-tenis.jpg` **no aparecen escritas en ningún archivo del frontend**, PERO los scripts del backend (`scripts/migrate_sports.js` y `scripts/update_sports_images.js`) guardaron esas rutas en la columna `image_url` de la tabla `sports` de la base de datos. La vista de deportes renderiza `<img src={sport.image_url}>`, así que **sí se usan en producción** a través de datos, no de código. Si se borran, las canchas perderían su foto.

#### ✔️ En uso confirmado:
- `public/favicon.svg` — referenciado en `index.html`.

### 4.4 Dependencias npm sin usar

Estas librerías están en `package.json` (se descargan con `npm install`) pero el código activo no las importa:

| Dependencia | Estado | Explicación |
|---|---|---|
| `@base-ui/react` | ❌ Sin uso efectivo | Su único importador era `button.tsx` (muerto). Era la base de componentes del botón nunca adoptado. |
| `class-variance-authority` | ❌ Sin uso efectivo | Ídem: solo la usaba `button.tsx` para definir variantes. |
| `clsx` | ⚠️ Muerta en cadena | Solo la importa `lib/utils.ts`, cuyo único consumidor está muerto. Removible tras borrar esa cadena. |
| `tailwind-merge` | ⚠️ Muerta en cadena | Ídem. Además aparece en `optimizeDeps` de `vite.config.js` para nada. |
| `shadcn` | ✔️ Usado (caso raro) | Se importa su CSS en `index.css` (`@import 'shadcn/tailwind.css'`). Es inusual (shadcn es una CLI, no una librería runtime), pero técnicamente está referenciado. Revisar si ese import funciona como se espera. |

### 4.5 Hallazgos menores

- **Import muerto en `app-content.tsx:2`:** `import { Menu } from 'lucide-react'` nunca se usa en el JSX. Probablemente quedó de un botón hamburguesa móvil que fue eliminado. Borrar la línea.
- **Tipos exportados sin consumidores externos:** `SearchableSelectOption` (`searchable-select.tsx:5`) y `PrintFormat` (`printUtils.ts:1`) solo se usan internamente en su propio archivo. Menor.
- **Buenas noticias:** Las 14 vistas lazy-load están todas conectadas al switch de `renderView()` en `app-content.tsx`; `main.jsx` y `App.jsx` están limpios, sin variables muertas.

---

## 5. Hallazgos del BACKEND

### 5.1 Archivos completos sin usar

#### 🔴 `src/routes/statsRoutes.js` (9 líneas) + `src/controllers/statsController.js` (218 líneas)
- **Qué son:** Una pareja ruta+controlador que expone estadísticas del dashboard.
- **Evidencia:** `app.js` monta **15 routers** (líneas 87–101) y `statsRoutes` **no está entre ellos**. La búsqueda de `statsRoutes` en todo el backend solo encuentra el propio archivo. Tampoco aparece en la colección de Postman ni en la guía de pruebas de la API.
- **Contexto importante:** Existe un **duplicado funcional**: `dashboardController.getDashboardStats` sí está montado en `/api/dashboard/stats` y es el que el frontend consume. Parece que `statsController` fue un intento de reemplazo (o versión anterior) que nunca se conectó.
- **Decisión pendiente:** Ambos controladores hacen cosas similares pero `statsController` es más completo (218 vs 202 líneas). Antes de borrarlo, comparar si tiene lógica que valga la pena portar al dashboard montado.

#### 🔴 `src/utils/businessConfig.js` (32 líneas)
- **Qué es:** Un intento de centralizar la configuración del negocio (horarios, tarifas, etc.) en constantes de código.
- **Evidencia:** Cero imports en todo el backend.
- **Por qué quedó obsoleto:** La configuración real ahora vive en la **base de datos** (tabla `business_settings`, gestionada vía `settingsController`), lo cual es mejor diseño: permite cambiar horarios sin redesplegar el servidor. Además, algunos valores quedaron hardcodeados en controllers (ver sección 6).

#### 🔴 `src/utils/venezuelanHolidays.js` (146 líneas)
- **Qué es:** Lista de feriados venezolanos por año con funciones helper (`isVenezuelanHoliday`, `getHolidayName`, `getHolidaysForYear`). Seguramente pensada para bloquear reservas en feriados.
- **Evidencia:** Cero imports en todo el backend.
- **Conclusión:** Todo el directorio `src/utils/` está muerto. Ningún controller consume nada de él.

### 5.2 Exportaciones sin usar

- `src/config/redis.js`:
  - `redisClient` (línea 66): se exporta pero nadie lo importa fuera del propio archivo. El caché se accede solo a través de `cacheMiddleware`.
  - `clearCache` (línea 51): solo se usa internamente. El `export` sobra (no es error, solo ruido).
- Los **15 controladores montados están limpios**: cada función exportada coincide 1:1 con su route file. 👍

### 5.3 Dependencias npm sin usar

| Dependencia | Evidencia | Explicación |
|---|---|---|
| `joi` ^17.13.3 | Cero `require('joi')` | Librería de validación. El proyecto validó con Joi en algún momento, pero migró a **zod** (usado en `validate.js` y `userRoutes.js`). Quedó instalada de la época anterior. |
| `pg-pool` ^3.13.0 | Cero `require('pg-pool')` | Wrapper para PostgreSQL. Innecesario: el código crea pools directamente con `new Pool` desde `pg` (en `database.js` y scripts). |
| `google-auth-library` ^10.7.0 | Cero require | SDK oficial de Google. El login con Google se implementa con un `fetch` nativo al endpoint `oauth2/v3/userinfo` (`authController.js:547`), que funciona perfectamente sin SDK. |

Eliminar estas tres reduce el peso de `node_modules` y el tiempo de instalación/despliegue.

### 5.4 Scripts rotos (crashean al ejecutarlos)

Estos archivos **no son solo código muerto: están rotos**. Intentan importar módulos que no existen en el proyecto actual, así que lanzan `Cannot find module` apenas se ejecutan. Son evidencia de que hubo una estructura anterior (`src/models/`, `src/services/`) que fue refactorizada.

| Script | Require roto | Qué hacía |
|---|---|---|
| `create_admin_user.js` | `./src/models/users`, `./src/models/roles`, `./src/services/authService` | Creaba el usuario administrador inicial |
| `migrate_plaintext_passwords.js` | mismos módulos inexistentes | Hasheaba contraseñas guardadas en texto plano |
| `scripts/scratch_test_bookings.js` | `./src/config/db` (el real es `config/database.js`) | Prueba manual de queries de reservas |

**Recomendación:** Archivarlos o eliminarlos. Si `create_admin_user.js` aún se necesita para nuevos entornos, habría que reescribirlo contra la estructura actual.

### 5.5 Scripts de migración one-off (ya ejecutados)

Estos scripts **sí funcionan**, pero son migraciones puntuales que ya corrieron contra la base de datos. Su trabajo está hecho y quedaron registrados en git. No rompen nada donde están, pero ensucian el repositorio. Clasificación:

**Utilidades reutilizables (conservar):**
- `server.js`, `test_db.js` — entry point y diagnóstico de conexión.
- `scripts/check-db.js`, `check-users.js`, `test-db.js`, `test-mail.js` — diagnósticos de esquema/conexión DB y SMTP.

**One-off archivables (trabajo ya hecho):**
- `migrate_db.js` — split de nombres, columnas de billings.
- `add_sport_column.js` — añadió columna `sport`… que luego `migrate_sports.js` **eliminó** (idempotencia rota entre scripts).
- `migrate_sports.js`, `update_sports_images.js`, `migrate_roles.js`, `migrate_customers_auth.js`, `migrate-cxc.js`, `migrate_purchases.js`, `migrate_settings.js`, `migrate_avatar.js` — creaciones/ajustes de tablas ya aplicados.
- `setup.js` — ⚠️ nombre engañoso: no configura nada genérico; es un parche de datos con IDs hardcodeados (`bookings.id=30`, `courts.id=7`). Solo sirvió para esa corrección puntual.
- `scripts/scratch_test.js`, `scratch_test_dashboard.js`, `test_bookings.js` — pruebas manuales desechables.

---

## 6. Hallazgos que NO son código muerto pero conviene revisar

Durante el análisis aparecieron situaciones que merecen atención aunque no entren en la categoría "sin usar":

1. **CORS duplicado y divergente:** La lista de orígenes permitidos se mantiene en dos sitios — `app.js:35-44` y `server.js:18-26` — y **ya difieren**: `app.js` incluye `https://websitecourtconnect.netlify.app` pero `server.js` no. Riesgo real: según cuál gane, un dominio legítimo podría ser bloqueado. Recomendación: unificar en un solo lugar (idealmente variable de entorno).

2. **`formatAMPM` triplicada:** La misma función auxiliar está copiada en `bookingController.js` (×2) y `dashboardController.js` (×1). No es dead code, pero es candidata a extraerse a un módulo compartido.

3. **`settingsRoutes.js` sin autenticación:** A diferencia del resto de rutas financieras/administrativas, `GET/PUT /api/settings` no tienen middleware `protect` ni `authorize`. Cualquiera podría leer (y cambiar) la configuración del negocio. **Posible vulnerabilidad de seguridad.**

4. **Puerto fijado en `server.js:13`:** Fuerza `PORT = 3000` ignorando `process.env.PORT` (comentario indica que es intencional para Railway). Documentarlo bien para evitar confusión en otros entornos.

5. **Validación con zod con cobertura mínima:** El middleware `validate.js` solo se aplica en `userRoutes.js`. El resto de endpoints valida a mano. No es bug, pero es inconsistencia arquitectónica.

---

## 7. Plan de limpieza recomendado por niveles de riesgo

### 🟢 Fase 1 — Segura (no afecta nada en runtime)
Verificada por grep exhaustivo; si se aplica completa, la app funciona idéntica.

**Frontend:**
1. Borrar `src/components/ui/button.tsx`, `src/lib/utils.ts`, `src/App.css`, `src/services/statsService.js`.
2. Quitar import muerto `Menu` en `app-content.tsx:2`.
3. Borrar assets: `hero.png`, `react.svg`, `vite.svg`, `icons.svg`, `ad-protip.jpg`, `avatar-1/2/3.jpg`, `court-1..5.jpg`, `court-8.jpg`. *(NO tocar `sport-*.jpg`)*
4. `npm uninstall @base-ui/react class-variance-authority clsx tailwind-merge` (las dos últimas tras el paso 1).
5. Quitar `tailwind-merge` de `optimizeDeps` en `vite.config.js`.

**Backend:**
6. Borrar `src/routes/statsRoutes.js`, `src/controllers/statsController.js` *(previa comparación con dashboardController por si hay lógica que portar)*, `src/utils/businessConfig.js`, `src/utils/venezuelanHolidays.js`.
7. `npm uninstall joi pg-pool google-auth-library`.

### 🟡 Fase 2 — Requiere decisión de equipo
8. Los 19 métodos de servicios frontend sin llamador (¿documentación de API o basura?).
9. Scripts one-off y rotos del backend → mover a carpeta `archive/` o borrar.
10. Resolver duplicado stats/dashboard conservando la mejor versión.

### 🔴 Fase 3 — Correcciones recomendadas (no son limpieza, sino mejoras detectadas)
11. Unificar configuración CORS (riesgo de bloqueo de dominio legítimo).
12. Agregar autenticación a `/api/settings` (posible fallo de seguridad).
13. Extraer `formatAMPM` a un módulo compartido.

---

*Reporte generado mediante análisis estático. Se recomienda ejecutar la suite de tests (`npm test` en Backend) y probar manualmente el flujo principal después de cada fase de limpieza.*
