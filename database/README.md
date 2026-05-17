🗄️ Database: Sports Management System
La base de datos está alojada en la nube mediante Neon.tech (PostgreSQL V18+).

📂 Estructura de la carpeta /database
schema.sql: Contiene la definición de tipos (ENUMS), tablas, secuencias y la lógica de los disparadores (triggers) para la auditoría.

seed.sql: Script con datos iniciales (5 registros por tabla) para pruebas funcionales.

database.js: Configuración del Pool de conexiones utilizando la librería pg.

🗺️ Diagrama Entidad-Relación (ERD)
Puedes visualizar la arquitectura de la base de datos de forma interactiva aquí:
🔗 Ver Diagrama en dbdiagram.io
https://dbdiagram.io/d/Copy-of-Untitled-Diagram-69dd84b10f7c9ef2c0eaaa70

🚀 Instrucciones de Instalación
Crea un proyecto en Neon.tech.

Ejecuta el contenido de schema.sql en el SQL Editor.

(Opcional) Ejecuta seed.sql para cargar datos de prueba.

Configura tu archivo .env con la variable DATABASE_URL proporcionada por Neon.
