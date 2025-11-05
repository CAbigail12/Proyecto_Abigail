const { Pool } = require('pg');
const config = require('./env');

const pool = new Pool({
  host: config.baseDatos.host,
  port: config.baseDatos.puerto,
  database: config.baseDatos.nombre,
  user: config.baseDatos.usuario,
  password: config.baseDatos.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false // Necesario para AWS RDS
  }
});

// Evento para manejar errores de conexión
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de conexiones:', err);
  process.exit(-1);
});

// Función para probar la conexión
const probarConexion = async () => {
  try {
    const cliente = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    cliente.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error.message);
    return false;
  }
};

// Función para inicializar el admin si no existe
const inicializarAdmin = async () => {
  let cliente;
  try {
    console.log('🔍 Verificando usuario admin...');
    const bcrypt = require('bcrypt');
    cliente = await pool.connect();
    
    // Verificar si existe el usuario admin
    const resultado = await cliente.query(
      'SELECT id_usuario FROM usuarios WHERE correo = $1',
      ['admin@dominio.com']
    );
    
    if (resultado.rows.length === 0) {
      console.log('👤 Creando usuario admin...');
      // Crear usuario admin
      const contrasenaHash = await bcrypt.hash('Admin123!', 10);
      await cliente.query(
        `INSERT INTO usuarios (nombre, apellido, correo, contrasena_hash, telefono, fotografia, rol_id, estado)
         VALUES ($1, $2, $3, $4, $5, $6,
                 (SELECT id_rol FROM roles WHERE nombre = 'ADMINISTRADOR'), $7)`,
        ['Admin', 'Sistema', 'admin@dominio.com', contrasenaHash, '+502 1234-5678', '/uploads/usuarios/admin-default.jpg', 'ACTIVO']
      );
      console.log('✅ Usuario admin creado correctamente');
    } else {
      console.log('✅ Usuario admin ya existe');
    }
    
  } catch (error) {
    console.error('❌ Error al inicializar admin:', error.message);
    console.error('❌ Stack trace:', error.stack);
    throw error; // Re-lanzar el error para que se maneje en el servidor
  } finally {
    if (cliente) {
      cliente.release();
      console.log('🔓 Conexión liberada');
    }
  }
};

module.exports = {
  pool,
  probarConexion,
  inicializarAdmin
};
