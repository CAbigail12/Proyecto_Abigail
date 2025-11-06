// Clase personalizada para errores de la aplicación
class ErrorAplicacion extends Error {
  constructor(mensaje, codigoEstado = 500, errores = null) {
    super(mensaje);
    this.codigoEstado = codigoEstado;
    this.errores = errores;
    this.esErrorOperacional = true;
  }
}

// Middleware para manejar errores
const manejadorErrores = (error, req, res, next) => {
  console.error('❌ Error capturado en manejadorErrores:');
  console.error('   Tipo:', error.constructor.name);
  console.error('   Mensaje:', error.message);
  console.error('   esErrorOperacional:', error.esErrorOperacional);
  console.error('   codigoEstado:', error.codigoEstado);
  console.error('   errores:', error.errores);
  console.error('   Stack:', error.stack);

  // Si es un error de validación de Joi
  if (error.isJoi) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Datos de entrada inválidos',
      errores: error.details.map(detail => ({
        campo: detail.path.join('.'),
        mensaje: detail.message
      }))
    });
  }

  // Si es un error de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      ok: false,
      mensaje: 'Token inválido'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      ok: false,
      mensaje: 'Token expirado'
    });
  }

  // Si es un error de la aplicación
  if (error.esErrorOperacional) {
    const mensaje = error.message || error.mensaje || 'Error en la operación';
    const codigoEstado = error.codigoEstado || 500;
    console.log(`📤 Enviando respuesta de error: ${codigoEstado} - ${mensaje}`);
    return res.status(codigoEstado).json({
      ok: false,
      mensaje: mensaje,
      errores: error.errores || null
    });
  }

  // Error interno del servidor
  console.log('📤 Enviando respuesta de error interno del servidor');
  res.status(500).json({
    ok: false,
    mensaje: error.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

// Función helper para crear errores
const crearError = (mensaje, codigoEstado = 500, errores = null) => {
  return new ErrorAplicacion(mensaje, codigoEstado, errores);
};

module.exports = {
  ErrorAplicacion,
  manejadorErrores,
  crearError
};
