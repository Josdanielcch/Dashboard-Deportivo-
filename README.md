# 🏟️ SportSpaces OS - Sistema Integral de Gestión Deportiva

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Neon Cloud](https://img.shields.io/badge/Neon_Cloud-00E599?style=for-the-badge&logo=neon&logoColor=black)

**SportSpaces OS** es una plataforma de software empresarial (SaaS-ready) diseñada para centralizar, automatizar y optimizar la administración de complejos deportivos multisport (fútbol, pádel, tenis, etc.). El sistema resuelve problemáticas reales de control de aforo, fugas de dinero en facturación y gestión manual de inventarios.

---

## ✨ Características Principales (Módulos Core)

* **📅 Motor de Reservas Inteligente:** Control estricto de horarios por tipo de cancha, tarifas diferenciadas por hora y prevención total de sobreventas (*Overbooking*).
* **💳 Facturación y Gestión de Pagos:** Módulo transaccional avanzado (`billings` y `sale_details`) con soporte para múltiples métodos de pago, abonos parciales y estados de cuenta en tiempo real.
* **🛒 Punto de Venta (POS) & Cafetería:** Control de inventario automatizado para la venta de productos, snacks o alquiler de equipamiento deportivo integrado directamente a la cuenta del cliente.
* **🔐 Seguridad y Auditoría Empresarial:** Sistema integrado de `audit_logs` que registra de manera transparente cada acción crítica (creación, modificación o cancelación de reservas), ideal para auditorías de gerencia.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Backend** | Node.js & Express.js | API RESTful escalable y optimizada. |
| **Base de Datos** | PostgreSQL 16+ | Modelo relacional robusto con restricciones de integridad severas. |
| **Cloud DB** | Neon.tech | Base de datos serverless en la nube con escalabilidad instantánea. |
| **Seguridad** | Bcrypt.js | Encriptación de credenciales a nivel de arquitectura. |

---

## 📐 Arquitectura de la Base de Datos

El diseño relacional fue estructurado para soportar alta transaccionalidad sin redundancia de datos. Puedes interactuar con el modelo arquitectónico aquí:

🔗 [Ver Diagrama Entidad-Relación Interactivo en DBDiagram.io](https://dbdiagram.io/d/Copy-of-Untitled-Diagram-69dd84b10f7c9ef2c0eaaa70)

---

## 🚀 Instalación y Despliegue Local

### Requisitos Previos
* Node.js v18 o superior instalado.
* Una instancia activa en PostgreSQL (o cuenta en Neon.tech).

### 1. Clonar el repositorio
```bash
git clone [https://github.com/Josdanielcch/Dashboard-Deportivo-.git](https://github.com/Josdanielcch/Dashboard-Deportivo-.git)
cd Dashboard-Deportivo-