// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  login, register, getMe, recoverPassword, resetPassword,
  clientLogin, clientRegister, clientRecoverPassword, clientResetPassword 
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/recover-password', recoverPassword);
router.post('/reset-password', resetPassword);

// Client (Website) Routes
router.post('/client/register', clientRegister);
router.post('/client/login', clientLogin);
router.post('/client/recover-password', clientRecoverPassword);
router.post('/client/reset-password', clientResetPassword);

module.exports = router;