require('dotenv').config();
const UsersModel = require('./src/models/users');
const authService = require('./src/services/authService');
const pool = require('./src/config/database');

const isBcryptHash = (value) => typeof value === 'string' && /^\$2[aby]\$/.test(value);

(async function main() {
  try {
    const users = await UsersModel.findAll();
    const plaintextUsers = users.filter((user) => !isBcryptHash(user.password_hash));

    if (!plaintextUsers.length) {
      console.log('No hay contraseñas plaintext para actualizar.');
      return;
    }

    console.log(`Encontrados ${plaintextUsers.length} usuarios con contraseña plaintext.`);
    for (const user of plaintextUsers) {
      const plainPassword = user.password_hash || '';
      if (!plainPassword) {
        console.log(`Omitido: ${user.username} no tiene valor de contraseña.`);
        continue;
      }

      const password_hash = await authService.hashPassword(plainPassword);
      await UsersModel.update(user.id, { password_hash });
      console.log(`Actualizada la contraseña del usuario: ${user.username}`);
    }

    console.log('Migración de contraseñas plaintext completada.');
  } catch (err) {
    console.error('Error migrando contraseñas:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
