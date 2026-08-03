// create_admin_user.js
// Script temporal para crear un usuario administrador con contraseña bcrypt.

require('dotenv').config();
const UsersModel = require('./src/models/users');
const RolesModel = require('./src/models/roles');
const authService = require('./src/services/authService');
const pool = require('./src/config/database');

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '12345';
const ADMIN_FULL_NAME = 'Administrador';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_ROLE_NAME = 'Admin';

async function findAdminRole() {
  const roles = await RolesModel.findAll();
  return roles.find((role) => {
    const name = String(role.role_name || '').toLowerCase();
    return name === 'admin' || name === 'administrador';
  });
}

async function ensureAdminRole() {
  let role = await findAdminRole();
  if (role) return role;

  console.log('Rol administrador no encontrado. Creando rol Admin...');
  return await RolesModel.create({
    role_name: ADMIN_ROLE_NAME,
    access_level: 10,
    description: 'Rol administrador con acceso completo',
  });
}

async function main() {
  try {
    const adminRole = await ensureAdminRole();
    const password_hash = await authService.hashPassword(ADMIN_PASSWORD);

    const existingUser = await UsersModel.findByUsername(ADMIN_USERNAME);
    if (existingUser) {
      console.log(`El usuario '${ADMIN_USERNAME}' ya existe. Actualizando contraseña y rol...`);
      const updated = await UsersModel.update(existingUser.id, {
        password_hash,
        full_name: ADMIN_FULL_NAME,
        email: ADMIN_EMAIL,
        role_id: adminRole.id,
        status: 'Activated',
      });
      console.log('Usuario administrador actualizado:', updated);
    } else {
      const user = await UsersModel.create({
        username: ADMIN_USERNAME,
        password_hash,
        full_name: ADMIN_FULL_NAME,
        email: ADMIN_EMAIL,
        role_id: adminRole.id,
        status: 'Activated',
      });
      console.log('Usuario administrador creado:', user);
    }

    console.log(`
Listo. Ahora puedes iniciar sesión con:
  username: ${ADMIN_USERNAME}
  password: ${ADMIN_PASSWORD}
`);
  } catch (error) {
    console.error('Error creando el usuario administrador:', error);
  } finally {
    await pool.end();
  }
}

main();
