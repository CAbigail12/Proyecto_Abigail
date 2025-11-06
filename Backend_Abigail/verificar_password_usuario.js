// Script para verificar la contraseña de un usuario directamente
const { pool } = require('./src/config/db');
const bcrypt = require('bcrypt');

async function verificarPassword() {
  const cliente = await pool.connect();
  try {
    const correo = 'luis@gmail.com';
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
    console.log('   Rol:', usuario.rol_nombre);
    console.log('   Hash completo:', usuario.contrasena_hash);
    console.log('   Hash (primeros 30 chars):', usuario.contrasena_hash?.substring(0, 30));
    
    // Verificar contraseña
    console.log('\n🔐 Verificando contraseña:', password);
    const contrasenaValida = await bcrypt.compare(password, usuario.contrasena_hash);
    console.log('   Contraseña válida:', contrasenaValida ? '✅ SÍ' : '❌ NO');
    
    if (!contrasenaValida) {
      console.log('\n⚠️  La contraseña no coincide. Generando nuevo hash...');
      const nuevoHash = await bcrypt.hash(password, 10);
      console.log('   Nuevo hash (primeros 30 chars):', nuevoHash.substring(0, 30));
      
      // Verificar que el nuevo hash funciona
      const verificado = await bcrypt.compare(password, nuevoHash);
      console.log('   Verificación del nuevo hash:', verificado ? '✅ OK' : '❌ ERROR');
      
      if (verificado) {
        // Actualizar contraseña
        console.log('\n💾 Actualizando contraseña en la base de datos...');
        await cliente.query(
          'UPDATE usuarios SET contrasena_hash = $1 WHERE id_usuario = $2',
          [nuevoHash, usuario.id_usuario]
        );
        
        console.log('✅ Contraseña actualizada');
        
        // Verificar nuevamente
        const verificacionFinal = await cliente.query(
          'SELECT contrasena_hash FROM usuarios WHERE id_usuario = $1',
          [usuario.id_usuario]
        );
        
        const hashGuardado = verificacionFinal.rows[0].contrasena_hash;
        const verificarLogin = await bcrypt.compare(password, hashGuardado);
        console.log('\n🔍 Verificación final:');
        console.log('   Hash guardado (primeros 30 chars):', hashGuardado?.substring(0, 30));
        console.log('   Login funcionaría:', verificarLogin ? '✅ SÍ' : '❌ NO');
        
        if (verificarLogin) {
          console.log('\n✅ ¡Contraseña actualizada correctamente! Ahora puedes hacer login con:');
          console.log('   Correo:', correo);
          console.log('   Contraseña:', password);
        }
      }
    } else {
      console.log('\n✅ La contraseña es correcta. El problema podría estar en otro lugar.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    cliente.release();
    await pool.end();
  }
}

verificarPassword();

