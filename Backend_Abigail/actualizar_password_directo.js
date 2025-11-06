// Script para actualizar la contraseña directamente usando la misma configuración del backend
const { pool } = require('./src/config/db');
const bcrypt = require('bcrypt');

async function actualizarPassword() {
  const cliente = await pool.connect();
  try {
    const correo = 'abigail@aju.com';
    const nuevaPassword = 'Admin123!';
    
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
    console.log('\n🔐 Generando nuevo hash para la contraseña:', nuevaPassword);
    const nuevoHash = await bcrypt.hash(nuevaPassword, 10);
    console.log('   Nuevo hash (primeros 30 chars):', nuevoHash.substring(0, 30));
    
    // Verificar que el hash funciona
    const verificado = await bcrypt.compare(nuevaPassword, nuevoHash);
    console.log('   Verificación del hash:', verificado ? '✅ OK' : '❌ ERROR');
    
    // Actualizar contraseña
    console.log('\n💾 Actualizando contraseña en la base de datos...');
    const updateResult = await cliente.query(
      'UPDATE usuarios SET contrasena_hash = $1 WHERE id_usuario = $2 RETURNING id_usuario, correo',
      [nuevoHash, usuario.id_usuario]
    );
    
    if (updateResult.rows.length === 0) {
      console.log('❌ No se pudo actualizar la contraseña');
      return;
    }
    
    console.log('✅ Contraseña actualizada para usuario:', updateResult.rows[0].correo);
    
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
    
    if (verificarLogin) {
      console.log('\n✅ ¡Contraseña actualizada correctamente! Ahora puedes hacer login con:');
      console.log('   Correo:', correo);
      console.log('   Contraseña:', nuevaPassword);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    cliente.release();
    await pool.end();
  }
}

actualizarPassword();

