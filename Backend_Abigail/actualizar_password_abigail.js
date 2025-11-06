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

async function actualizarPassword() {
  const cliente = await pool.connect();
  try {
    const correo = 'abigail@aju.com';
    const nuevaPassword = 'Admin123!'; // Cambia esto por la contraseña que quieres usar
    
    console.log('🔍 Buscando usuario:', correo);
    
    // Buscar usuario
    const resultado = await cliente.query(
      'SELECT id_usuario, correo, contrasena_hash, estado FROM usuarios WHERE correo = $1',
      [correo]
    );
    
    if (resultado.rows.length === 0) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    const usuario = resultado.rows[0];
    console.log('✅ Usuario encontrado:');
    console.log('   ID:', usuario.id_usuario);
    console.log('   Correo:', usuario.correo);
    console.log('   Estado:', usuario.estado);
    console.log('   Hash actual (primeros 30 chars):', usuario.contrasena_hash?.substring(0, 30));
    
    // Generar nuevo hash
    console.log('\n🔐 Generando nuevo hash para la contraseña...');
    const nuevoHash = await bcrypt.hash(nuevaPassword, 10);
    console.log('   Nuevo hash (primeros 30 chars):', nuevoHash.substring(0, 30));
    
    // Verificar que el hash funciona
    const verificado = await bcrypt.compare(nuevaPassword, nuevoHash);
    console.log('   Verificación del hash:', verificado ? '✅ OK' : '❌ ERROR');
    
    // Actualizar contraseña
    console.log('\n💾 Actualizando contraseña en la base de datos...');
    await cliente.query(
      'UPDATE usuarios SET contrasena_hash = $1 WHERE id_usuario = $2',
      [nuevoHash, usuario.id_usuario]
    );
    
    console.log('✅ Contraseña actualizada correctamente');
    
    // Verificar que se guardó correctamente
    const verificacion = await cliente.query(
      'SELECT contrasena_hash FROM usuarios WHERE id_usuario = $1',
      [usuario.id_usuario]
    );
    
    const hashGuardado = verificacion.rows[0].contrasena_hash;
    const verificarLogin = await bcrypt.compare(nuevaPassword, hashGuardado);
    console.log('\n🔍 Verificación final:');
    console.log('   Hash guardado (primeros 30 chars):', hashGuardado?.substring(0, 30));
    console.log('   Login funcionaría:', verificarLogin ? '✅ SÍ' : '❌ NO');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    cliente.release();
    await pool.end();
  }
}

actualizarPassword();

