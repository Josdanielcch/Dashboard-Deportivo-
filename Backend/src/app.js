// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const courtRoutes = require('./routes/courtRoutes');

// Middleware de error
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middlewares globales
app.use(helmet());

// CORS robusto y dinámico para desarrollo y producción
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (como Postman o llamadas directas del servidor)
    if (!origin) return callback(null, true);
    
    // Permitir cualquier subdominio/puerto de localhost o 127.0.0.1 para desarrollo fluido
    if (
      origin.startsWith('http://localhost:') || 
      origin.startsWith('http://127.0.0.1:') || 
      origin.startsWith('https://localhost:') || 
      origin.startsWith('https://127.0.0.1:')
    ) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin === process.env.CORS_ORIGIN) {
      return callback(null, true);
    } else {
      return callback(new Error('Bloqueado por política CORS'));
    }
  },
  credentials: true
}));
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

// Importar nuevas rutas
const customerRoutes = require('./routes/customerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const productRoutes = require('./routes/productRoutes');
const billingRoutes = require('./routes/billingRoutes');
const auditRoutes = require('./routes/auditRoutes');
const userRoutes = require('./routes/userRoutes');

// ... después de las otras rutas
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

// Middleware de error
app.use(errorHandler);

module.exports = app;