// src/services/storageService.js
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configuración de tipos y tamaños permitidos
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Directorio local de uploads (fallback seguro)
const UPLOADS_DIR = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Usamos memoryStorage para poder procesar la subida a la nube o a disco de forma agnóstica
const memoryStorage = multer.memoryStorage();

const uploadMiddleware = multer({
  storage: memoryStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_MIME_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes en formato JPG, PNG o WEBP de hasta 2MB'));
    }
  }
});

/**
 * Sube una imagen a almacenamiento en la nube (Cloudinary) si está configurado,
 * o la persiste localmente en disco como fallback.
 * 
 * @param {Object} file - Archivo proveniente de req.file (buffer, originalname, mimetype)
 * @param {String} prefix - Prefijo para el nombre del archivo (ej. id de usuario)
 * @returns {Promise<String>} - URL pública accesible del archivo
 */
const saveFile = async (file, prefix = 'file') => {
  if (!file || !file.buffer) {
    throw new Error('Archivo no proporcionado o inválido');
  }

  // 1. Verificar si Cloudinary está configurado en variables de entorno
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    try {
      const crypto = require('crypto');
      const timestamp = Math.round(new Date().getTime() / 1000);
      const publicId = `${prefix}-${Date.now()}`;
      
      // Generar firma de Cloudinary
      const signaturePayload = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signaturePayload).digest('hex');

      const formData = new FormData();
      const blob = new Blob([file.buffer], { type: file.mimetype });
      formData.append('file', blob, file.originalname);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('public_id', publicId);
      formData.append('signature', signature);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return data.secure_url;
      }
      console.warn('Fallo en subida a Cloudinary, usando almacenamiento local:', await response.text());
    } catch (cloudErr) {
      console.error('Error al subir a Cloudinary, recurriendo a disco local:', cloudErr.message);
    }
  }

  // 2. Almacenamiento Local (Fallback seguro para desarrollo o servidores con disco persistente)
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const uniqueName = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const targetPath = path.join(UPLOADS_DIR, uniqueName);

  await fs.promises.writeFile(targetPath, file.buffer);
  return `/uploads/avatars/${uniqueName}`;
};

module.exports = {
  uploadMiddleware,
  saveFile,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES
};
