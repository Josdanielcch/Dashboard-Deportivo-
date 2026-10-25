// src/routes/docsRoutes.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const openapiPath = path.join(__dirname, '../../../docs/openapi.yaml');

// Servir la especificación YAML cruda
router.get('/spec.yaml', (req, res) => {
  if (fs.existsSync(openapiPath)) {
    res.setHeader('Content-Type', 'text/yaml');
    return res.sendFile(openapiPath);
  }
  res.status(404).send('Especificación OpenAPI no encontrada');
});

// Servir la interfaz interactiva de Swagger UI mediante CDN oficial
router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>SportSpaces OS — Documentación Interactiva de API</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <style>
    body { margin: 0; background-color: #0f172a; }
    .swagger-ui { background-color: #ffffff; min-height: 100vh; padding-bottom: 40px; }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/docs/spec.yaml',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>
  `);
});

module.exports = router;
