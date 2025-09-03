const jwt = require('jsonwebtoken');
const config = require('../config/env');

// Generar token JWT
const generarToken = (datos) => {
  return jwt.sign(datos, config.jwt.secreto, {
    expiresIn: config.jwt.expiracion
  });
};

// Verificar token JWT
const verificarToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secreto);
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

// Extraer token del header Authorization
const extraerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token de autorización requerido');
  }
  return authHeader.substring(7);
};

module.exports = {
  generarToken,
  verificarToken,
  extraerToken
};
