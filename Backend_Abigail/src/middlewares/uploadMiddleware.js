const multer = require('multer');
const path = require('path');
const { crearError } = require('../utils/errorHandler');

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/usuarios/');
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'usuario-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  // Permitir solo imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(crearError('Solo se permiten archivos de imagen', 400), false);
  }
};

// Configurar multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

// Middleware para subir una imagen
const uploadImagen = upload.single('fotografia');

// Middleware para validar la subida de archivos
const validarSubida = (req, res, next) => {
  uploadImagen(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(crearError('El archivo es demasiado grande. Máximo 5MB', 400));
      }
      return next(crearError('Error al subir el archivo', 400));
    } else if (err) {
      return next(err);
    }
    
    // Si se subió un archivo, agregar la ruta al body
    if (req.file) {
      req.body.fotografia = `/uploads/usuarios/${req.file.filename}`;
    }
    
    // Los campos de texto del FormData ya están en req.body gracias a multer
    // Convertir rol_id a número si existe
    if (req.body.rol_id && typeof req.body.rol_id === 'string') {
      req.body.rol_id = parseInt(req.body.rol_id);
    }
    
    console.log('📦 FormData procesado - Campos recibidos:', Object.keys(req.body));
    console.log('📦 Contraseña en body:', req.body.contrasena ? 'SÍ (longitud: ' + req.body.contrasena.length + ')' : 'NO');
    
    next();
  });
};

module.exports = {
  uploadImagen,
  validarSubida
};
