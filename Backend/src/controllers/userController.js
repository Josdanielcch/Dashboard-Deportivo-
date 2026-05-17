const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, full_name, role_id, status, created_at
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
      SELECT id, username, full_name, role_id, status, created_at
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
    const { username, password, full_name, role_id } = req.body;

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
      INSERT INTO users (username, password_hash, full_name, role_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, full_name, role_id, status, created_at
    `, [username, password_hash, full_name, role_id || 1]); // role_id 1 por defecto (Admin, según semilla)
    
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
    const { full_name, role_id, status } = req.body;
    
    const result = await pool.query(`
      UPDATE users 
      SET full_name = COALESCE($1, full_name),
          role_id = COALESCE($2, role_id),
          status = COALESCE($3, status)
      WHERE id = $4
      RETURNING id, username, full_name, role_id, status
    `, [full_name, role_id, status, id]);
    
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

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus
};
