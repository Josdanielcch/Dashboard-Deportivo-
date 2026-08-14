// src/app.js
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');


// Importar rutas
const authRoutes = require('./routes/authRoutes');
const courtRoutes = require('./routes/courtRoutes');
const customerRoutes = require('./routes/customerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const productRoutes = require('./routes/productRoutes');
const billingRoutes = require('./routes/billingRoutes');
const auditRoutes = require('./routes/auditRoutes');
const userRoutes = require('./routes/userRoutes');
const cxcRoutes = require('./routes/cxcRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const cxpRoutes = require('./routes/cxpRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const sportRoutes = require('./routes/sportRoutes');

const { apiLimiter } = require('./middleware/rateLimiter');

// Middleware de error
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

const cors = require('cors');
app.use(cors({
  origin: [
    'https://rococo-malasada-e1ce07.netlify.app',
    'https://websitecourtconnect.netlify.app',
    'https://aplicationfrontend.netlify.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:4000',
    'http://localhost:8080',
    'http://panel.localhost:8080'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
}));

// Middlewares globales
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir la carpeta de subidas estáticamente
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Wrapper para envolver todas las respuestas JSON en { success, data }
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    if (body && typeof body === 'object' && !body.success && !body.errors && !body.error) {
      return originalJson({ success: true, data: body });
    }
    return originalJson(body);
  };
  next();
});

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Canchas API',
    environment: process.env.NODE_ENV
  });
});

// Rate limit general para toda la API
app.use('/api', apiLimiter);

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/products', productRoutes);
app.use('/api/billings', billingRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cxc', cxcRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/cxp', cxpRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/sports', sportRoutes);

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