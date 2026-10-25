// src/routes/settingsRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { setAuditContext } = require('../middleware/auditContext');
const settingsController = require('../controllers/settingsController');

// Obtener configuración pública (Nombre, logo, colores, moneda) para Web y Panel
router.get('/', settingsController.getSettings);

// Actualizar configuración empresarial (Exclusivo Administrador)
router.put('/', protect, authorize(1), setAuditContext, settingsController.updateSettings);

module.exports = router;
