// src/app.js
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const courtRoutes = require('./routes/courtRoutes');
const customerRoutes = require('./routes/customerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const productRoutes = require('./routes/productRoutes');
const billingRoutes = require('./routes/billingRoutes');
const auditRoutes = require('./routes/auditRoutes');
const userRoutes = require('./routes/userRoutes');

// Middleware de error
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middlewares globales
app.use(helmet());

// --- INICIO DEL BLOQUE CORS MANUAL DEFINITIVO ---
app.use((req, res, next) => {
  // Lista de dominios permitidos (Netlify y tu entorno local)
  const allowedOrigins = [
    'https://rococo-malasada-e1ce07.netlify.app',
    'http://localhost:5173',
    'http://localhost:5174'
  ];
  const origin = req.headers.origin;

  // Si la petición viene de un dominio permitido, le damos acceso
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    // Por defecto forzamos Netlify por si acaso
    res.header('Access-Control-Allow-Origin', 'https://rococo-malasada-e1ce07.netlify.app');
  }

  // Cabeceras obligatorias para el navegador
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Interceptar y aprobar automáticamente la petición OPTIONS (Preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});
// --- FIN DEL BLOQUE CORS MANUAL DEFINITIVO ---

app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Canchas API',
    environment: process.env.NODE_ENV
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/products', productRoutes);
app.use('/api/billings', billingRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/users', userRoutes);

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Middleware de error global
app.use(errorHandler);

module.exports = app;