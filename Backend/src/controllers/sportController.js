const pool = require('../config/database');

const getAllSports = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sports ORDER BY id');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error in getAllSports:', error);
    res.status(500).json({ error: 'Error al obtener deportes' });
  }
};

const createSport = async (req, res) => {
  try {
    const { name, image_url } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre es requerido' });

    const result = await pool.query(
      'INSERT INTO sports (name, image_url) VALUES ($1, $2) RETURNING *',
      [name, image_url]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'El deporte ya existe' });
    console.error('Error in createSport:', error);
    res.status(500).json({ error: 'Error al crear deporte' });
  }
};

const updateSport = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image_url } = req.body;

    if (!name) return res.status(400).json({ error: 'El nombre es requerido' });

    const result = await pool.query(
      'UPDATE sports SET name = $1, image_url = $2 WHERE id = $3 RETURNING *',
      [name, image_url, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Deporte no encontrado' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error in updateSport:', error);
    res.status(500).json({ error: 'Error al actualizar deporte' });
  }
};

const deleteSport = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si hay canchas asociadas
    const checkCourts = await pool.query('SELECT COUNT(*) FROM courts WHERE sport_id = $1', [id]);
    if (parseInt(checkCourts.rows[0].count) > 0) {
      return res.status(400).json({ error: 'No se puede eliminar el deporte porque hay canchas asociadas a él.' });
    }

    const result = await pool.query('DELETE FROM sports WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Deporte no encontrado' });

    res.json({ success: true, message: 'Deporte eliminado' });
  } catch (error) {
    console.error('Error in deleteSport:', error);
    res.status(500).json({ error: 'Error al eliminar deporte' });
  }
};

module.exports = {
  getAllSports,
  createSport,
  updateSport,
  deleteSport
};
