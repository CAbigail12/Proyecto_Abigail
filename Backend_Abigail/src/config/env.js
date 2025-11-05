const path = require('path');
const envPath = path.resolve(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

const config = {
  puerto: process.env.PORT || 3000,
  baseDatos: {
    host: process.env.DB_HOST || 'localhost',
    puerto: process.env.DB_PORT || 5432,
    nombre: process.env.DB_NAME || 'mi_basedatos',
    usuario: process.env.DB_USER || 'mi_usuario',
    password: process.env.DB_PASSWORD || 'mi_password'
  },
  jwt: {
    secreto: process.env.JWT_SECRET || 'secreto_por_defecto_cambiar',
    expiracion: process.env.JWT_EXPIRES_IN || '1d'
  },
  aplicacion: {
    borradoFisico: process.env.BORRADO_FISICO === 'true'
  }
};

module.exports = config;
