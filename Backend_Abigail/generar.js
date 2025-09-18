const bcrypt = require('bcrypt');

// Contraseña que quieres hashear
const contrasena = 'Admin123!';

// Generar el hash
bcrypt.hash(contrasena, 10)
  .then(hash => {
    console.log('🔐 Contraseña original:', contrasena);
    console.log('🔑 Hash generado:', hash);
    console.log('\n📋 Query SQL para insertar en la base de datos:');
    console.log('----------------------------------------');
    console.log(`UPDATE usuarios SET contrasena_hash = '${hash}' WHERE correo = 'admin@dominio.com';`);
    console.log('----------------------------------------');
  })
  .catch(error => {
    console.error('❌ Error al generar el hash:', error);
  });
