const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, first_name, last_name, role_id, status, created_at, first_name || ' ' || last_name AS full_name
      FROM users
      ORDER BY id
    `);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios del sistema' });
  }
};

// Obtener usuario por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT id, username, first_name, last_name, role_id, status, created_at, first_name || ' ' || last_name AS full_name
      FROM users WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

// Crear usuario
const createUser = async (req, res) => {
  try {
    const { username, password, first_name, last_name, role_id } = req.body;

    // Verificar si el usuario ya existe
    const userExist = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userExist.rows.length > 0) {
      return res.status(409).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // El status por defecto es 'Activated' según la BBDD
    const result = await pool.query(`
      INSERT INTO users (username, password_hash, first_name, last_name, role_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, first_name, last_name, role_id, status, created_at, first_name || ' ' || last_name AS full_name
    `, [username, password_hash, first_name, last_name, role_id || 1]); // role_id 1 por defecto (Admin, según semilla)
    
    res.status(201).json({ success: true, message: 'Usuario creado exitosamente', data: result.rows[0] });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// Actualizar usuario
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, role_id, status } = req.body;
    
    const result = await pool.query(`
      UPDATE users 
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          role_id = COALESCE($3, role_id),
          status = COALESCE($4, status)
      WHERE id = $5
      RETURNING id, username, first_name, last_name, role_id, status, first_name || ' ' || last_name AS full_name
    `, [first_name, last_name, role_id, status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ success: true, message: 'Usuario actualizado', data: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Eliminar / Deshabilitar usuario
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buena práctica: en lugar de borrar el registro (DELETE), lo desactivamos (Soft Delete)
    const result = await pool.query(`
      UPDATE users 
      SET status = 'Disabled'
      WHERE id = $1
      RETURNING id, username, status
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ 
      success: true, 
      message: 'Usuario deshabilitado correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al deshabilitar usuario:', error);
    res.status(500).json({ error: 'Error al deshabilitar usuario' });
  }
};

// Actualizar el estado de un usuario (PATCH)
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await pool.query(`
      UPDATE users 
      SET status = $1
      WHERE id = $2
      RETURNING id, username, full_name, role_id, status
    `, [status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ success: true, message: 'Estado del usuario actualizado', data: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar estado del usuario:', error);
    res.status(500).json({ error: 'Error al actualizar estado del usuario' });
  }
};

// Actualizar el propio perfil (sin requerir permisos de admin)
const updateMyProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const { first_name, last_name, new_password, current_password } = req.body;
    
    let result;
    if (new_password && new_password.trim() !== '') {
      if (!current_password) {
        return res.status(400).json({ error: 'Debes proporcionar tu contraseña actual para cambiarla' });
      }

      // Obtener el hash actual de la DB
      const userRes = await pool.query('SELECT password_hash FROM users WHERE id = $1', [id]);
      if (userRes.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Verificar contraseña actual
      const isMatch = await bcrypt.compare(current_password, userRes.rows[0].password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(new_password, salt);
      
      result = await pool.query(`
        UPDATE users 
        SET first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            password_hash = $3
        WHERE id = $4
        RETURNING id, username, first_name, last_name, role_id, status, first_name || ' ' || last_name AS full_name
      `, [first_name, last_name, password_hash, id]);
    } else {
      result = await pool.query(`
        UPDATE users 
        SET first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name)
        WHERE id = $3
        RETURNING id, username, first_name, last_name, role_id, status, first_name || ' ' || last_name AS full_name
      `, [first_name, last_name, id]);
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ success: true, message: 'Perfil actualizado exitosamente', data: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateMyProfile
};
