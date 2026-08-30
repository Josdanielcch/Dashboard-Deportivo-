require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const migrateRoles = async () => {
  const client = await pool.connect();
  try {
    console.log('Iniciando migración de roles...');
    await client.query('BEGIN');

    // 1. Asegurar que los 4 roles principales existen
    await client.query(`
      INSERT INTO roles (id, role_name, description) VALUES 
      (1, 'Administrador', 'Dueños del negocio (Acceso total)'),
      (2, 'Recepcionista', 'Trabajador del local (Operaciones)'),
      (3, 'Soporte', 'Soporte técnico y mantenimiento'),
      (10, 'Cliente', 'Cliente del sitio web')
      ON CONFLICT (id) DO UPDATE 
      SET role_name = EXCLUDED.role_name, description = EXCLUDED.description;
    `);
    console.log('Roles principales configurados correctamente.');

    // 2. Mover a los usuarios que tengan roles obsoletos al rol 2 (Recepcionista)
    // Roles obsoletos: 4, 5, 6. (Role 7 era cliente también, lo movemos a 10).
    const updateResult = await client.query(`
      UPDATE users 
      SET role_id = 2 
      WHERE role_id NOT IN (1, 2, 3, 10) AND role_id != 7;
    `);
    console.log(`Usuarios con roles obsoletos actualizados a Recepcionista: ${updateResult.rowCount}`);

    // Mover roles 7 a 10
    const updateClients = await client.query(`
      UPDATE users 
      SET role_id = 10 
      WHERE role_id = 7;
    `);
    console.log(`Usuarios actualizados de rol 7 a 10: ${updateClients.rowCount}`);

    // 3. Eliminar los roles obsoletos
    const deleteResult = await client.query(`
      DELETE FROM roles 
      WHERE id NOT IN (1, 2, 3, 10);
    `);
    console.log(`Roles obsoletos eliminados: ${deleteResult.rowCount}`);

    await client.query('COMMIT');
    console.log('Migración de roles completada con éxito.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error durante la migración de roles:', error);
  } finally {
    client.release();
    pool.end();
    process.exit(0);
  }
};

migrateRoles();
