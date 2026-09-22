// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { loginLimiter, authActionLimiter } = require('../middleware/rateLimiter');
const { 
  login, register, getMe, recoverPassword, resetPassword,
  clientLogin, clientRegister, clientRecoverPassword, clientResetPassword, clientGoogleLogin,
  refreshTokenHandler, clientRefreshTokenHandler, logoutHandler, clientLogoutHandler
} = require('../controllers/authController');

router.post('/register', authActionLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refreshTokenHandler);
router.post('/logout', logoutHandler);
router.get('/me', protect, getMe);
router.post('/recover-password', authActionLimiter, recoverPassword);
router.post('/reset-password', authActionLimiter, resetPassword);

// Client (Website) Routes
router.post('/client/register', authActionLimiter, clientRegister);
router.post('/client/login', loginLimiter, clientLogin);
router.post('/client/refresh', clientRefreshTokenHandler);
router.post('/client/logout', clientLogoutHandler);
router.post('/client/recover-password', authActionLimiter, clientRecoverPassword);
router.post('/client/reset-password', authActionLimiter, clientResetPassword);
router.post('/client/google', loginLimiter, clientGoogleLogin);

module.exports = router;