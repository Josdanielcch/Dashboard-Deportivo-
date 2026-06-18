// src/controllers/courtController.js
const pool = require('../config/database');

const getAllCourts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, court_name, status 
      FROM courts 
      ORDER BY id
    `);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener canchas' });
  }
};

const getCourtById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM courts WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cancha no encontrada' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cancha' });
  }
};

const createCourt = async (req, res) => {
  try {
    const { court_name, status } = req.body;
    
    if (!court_name) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    
    const result = await pool.query(
      'INSERT INTO courts (court_name, status) VALUES ($1, $2) RETURNING *',
      [court_name, status || 'Available']
    );
    
    res.status(201).json({
      success: true,
      message: 'Cancha creada',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear' });
  }
};

const updateCourtStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['Available', 'Occupied', 'Maintenance', 'Out_of_service'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    
    const result = await pool.query(
      'UPDATE courts SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cancha no encontrada' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
};

const updateCourt = async (req, res) => {
  try {
    const { id } = req.params;
    const { court_name, status } = req.body;
    
    if (!court_name) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    
    const result = await pool.query(
      'UPDATE courts SET court_name = $1, status = COALESCE($2, status) WHERE id = $3 RETURNING *',
      [court_name, status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cancha no encontrada' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cancha' });
  }
};

const deleteCourt = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar si tiene reservas
    const bookingsCheck = await pool.query('SELECT COUNT(*) FROM bookings WHERE court_id = $1', [id]);
    const bookingsCount = parseInt(bookingsCheck.rows[0].count, 10);
    
    if (bookingsCount > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la cancha porque tiene reservas históricas o futuras asociadas. Para no corromper el historial, recomendamos editarla y cambiar su estado a "Fuera de Servicio".' 
      });
    }
    
    const result = await pool.query('DELETE FROM courts WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cancha no encontrada' });
    }
    
    res.json({ success: true, message: 'Cancha eliminada exitosamente' });
  } catch (error) {
    console.error('Error in deleteCourt:', error);
    res.status(500).json({ error: 'Error al eliminar cancha', detail: error.message });
  }
};

module.exports = {
  getAllCourts,
  getCourtById,
  createCourt,
  updateCourtStatus,
  updateCourt,
  deleteCourt
};