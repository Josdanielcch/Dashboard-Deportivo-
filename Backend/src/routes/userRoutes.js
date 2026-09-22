const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { setAuditContext } = require('../middleware/auditContext');
const userController = require('../controllers/userController');
const { validate } = require('../middleware/validate');
const { z } = require('zod');
const multer = require('multer');
const path = require('path');

// Configuración de multer con validación de tipo y tamaño (máx 2MB)
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/avatars'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.params.id + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1
  },
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes en formato JPG, PNG o WEBP de hasta 2MB'));
    }
  }
});

// Middleware para capturar y responder amigablemente a errores de Multer (ej. archivo muy grande)
const uploadAvatarMiddleware = (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'La imagen supera el límite permitido de 2MB' });
        }
        return res.status(400).json({ error: `Error en subida: ${err.message}` });
      }
      return res.status(400).json({ error: err.message || 'Archivo no permitido' });
    }
    next();
  });
};


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
router.use(setAuditContext);

// Ruta para que el usuario actualice su propio perfil (no requiere authorize admin)
router.put('/profile', userController.updateMyProfile);

// Permitir subir avatar si es administrador (role 1) o si es el propio usuario
const authorizeSelfOrAdmin = (req, res, next) => {
  const currentRole = req.user?.role_id ?? req.user?.role;
  if (currentRole === 1 || String(req.user?.id) === String(req.params.id)) {
    return next();
  }
  return res.status(403).json({ error: 'Acceso denegado: solo puedes actualizar tu propio avatar' });
};
router.post('/:id/avatar', authorizeSelfOrAdmin, uploadAvatarMiddleware, userController.uploadAvatar);

// Las siguientes rutas son solo para administradores
router.use(authorize(1));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

// Aplicamos el middleware de Zod aquí
router.post('/', validate(createUserSchema), userController.createUser);
router.put('/:id', validate(updateUserSchema), userController.updateUser);
router.patch('/:id/status', validate(updateUserStatusSchema), userController.updateUserStatus);

router.delete('/:id', userController.deleteUser);

module.exports = router;
