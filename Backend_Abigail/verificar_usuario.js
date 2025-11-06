const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function verificarUsuario() {
  const cliente = await pool.connect();
  try {
    const correo = 'abigail@aju.com';
    const password = 'Admin123!';
    
    console.log('🔍 Buscando usuario:', correo);
    
    // Buscar usuario
    const resultado = await cliente.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.contrasena_hash, u.estado, u.rol_id,
              r.nombre as rol_nombre
       FROM usuarios u
       LEFT JOIN roles r ON u.rol_id = r.id_rol
       WHERE u.correo = $1`,
      [correo]
    );
    
    if (resultado.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    const usuario = resultado.rows[0];
    console.log('✅ Usuario encontrado:');
    console.log('   ID:', usuario.id_usuario);
    console.log('   Nombre:', usuario.nombre, usuario.apellido);
    console.log('   Correo:', usuario.correo);
    console.log('   Estado:', usuario.estado);
    console.log('   Rol ID:', usuario.rol_id);
    console.log('   Rol Nombre:', usuario.rol_nombre);
    console.log('   Hash (primeros 30 chars):', usuario.contrasena_hash?.substring(0, 30));
    
    // Verificar contraseña
    console.log('\n🔐 Verificando contraseña...');
    const contrasenaValida = await bcrypt.compare(password, usuario.contrasena_hash);
    console.log('   Contraseña válida:', contrasenaValida ? '✅ SÍ' : '❌ NO');
    
    if (!contrasenaValida) {
      console.log('\n⚠️  La contraseña no coincide. Generando nuevo hash...');
      const nuevoHash = await bcrypt.hash(password, 10);
      console.log('   Nuevo hash (primeros 30 chars):', nuevoHash.substring(0, 30));
      
      // Actualizar contraseña
      await cliente.query(
        'UPDATE usuarios SET contrasena_hash = $1 WHERE id_usuario = $2',
        [nuevoHash, usuario.id_usuario]
      );
      
      console.log('✅ Contraseña actualizada');
      
      // Verificar nuevamente
      const verificado = await bcrypt.compare(password, nuevoHash);
      console.log('   Verificación final:', verificado ? '✅ OK' : '❌ ERROR');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    cliente.release();
    await pool.end();
  }
}

verificarUsuario();

