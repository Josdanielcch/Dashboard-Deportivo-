// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { login, getMe, recoverPassword, resetPassword } = require('../controllers/authController');

router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/recover-password', recoverPassword);
router.post('/reset-password', resetPassword);

module.exports = router;