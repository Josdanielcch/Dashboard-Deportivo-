const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const { validate } = require('../middleware/validate');
const { z } = require('zod');
const multer = require('multer');
const path = require('path');

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/avatars'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.params.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Esquema de validación para crear usuario con Zod
const createUserSchema = z.object({
  body: z.object({
    username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    full_name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    role_id: z.number().optional()
  })
});

// Esquema de validación para actualizar usuario
const updateUserSchema = z.object({
  body: z.object({
    full_name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").optional(),
    role_id: z.number().optional(),
    status: z.enum(['Activated', 'Disabled']).optional()
  })
});

// Esquema de validación para actualizar estado (PATCH)
const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(['Activated', 'Disabled'], {
      required_error: "El estado es requerido",
      invalid_type_error: "El estado debe ser 'Activated' o 'Disabled'"
    })
  })
});

// Rutas protegidas
router.use(protect);

// Ruta para que el usuario actualice su propio perfil (no requiere authorize admin)
router.put('/profile', userController.updateMyProfile);

// Las siguientes rutas son solo para administradores
router.use(authorize(1));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

// Aplicamos el middleware de Zod aquí
router.post('/', validate(createUserSchema), userController.createUser);
router.put('/:id', validate(updateUserSchema), userController.updateUser);
router.patch('/:id/status', validate(updateUserStatusSchema), userController.updateUserStatus);
router.post('/:id/avatar', upload.single('avatar'), userController.uploadAvatar);

router.delete('/:id', userController.deleteUser);

module.exports = router;
