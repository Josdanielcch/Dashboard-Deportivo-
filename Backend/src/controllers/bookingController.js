// src/controllers/bookingController.js
const pool = require('../config/database');

// Obtener todas las reservas (con datos relacionados)
const getAllBookings = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.id, b.booking_date, b.start_time, b.end_time, b.status,
             c.full_name as customer_name, c.phone, 
             co.court_name,
             u.username as created_by
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN courts co ON b.court_id = co.id
      JOIN users u ON b.user_id = u.id
      ORDER BY b.booking_date DESC, b.start_time
    `);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

// Obtener reservas por fecha
const getBookingsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const result = await pool.query(`
      SELECT b.id, b.start_time, b.end_time, b.status,
             c.full_name as customer_name,
             co.court_name
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN courts co ON b.court_id = co.id
      WHERE b.booking_date = $1
      ORDER BY b.start_time
    `, [date]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

// Verificar disponibilidad de cancha
const checkAvailability = async (req, res) => {
  try {
    const { court_id, booking_date, start_time, end_time } = req.query;
    
    if (!court_id || !booking_date || !start_time || !end_time) {
      return res.status(400).json({ error: 'Faltan parámetros' });
    }
    
    const result = await pool.query(`
      SELECT COUNT(*) as conflict_count
      FROM bookings
      WHERE court_id = $1 
        AND booking_date = $2
        AND status NOT IN ('Cancelled', 'No_show')
        AND (start_time, end_time) OVERLAPS ($3, $4)
    `, [court_id, booking_date, start_time, end_time]);
    
    const available = result.rows[0].conflict_count === 0;
    res.json({ 
      success: true, 
      available,
      message: available ? 'Cancha disponible' : 'Cancha ocupada en ese horario'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar disponibilidad' });
  }
};

// Crear nueva reserva
const createBooking = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { customer_id, court_id, booking_date, start_time, end_time, user_id } = req.body;
    
    // Validaciones
    if (!customer_id || !court_id || !booking_date || !start_time || !end_time) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    // Verificar disponibilidad
    const conflict = await client.query(`
      SELECT COUNT(*) FROM bookings
      WHERE court_id = $1 AND booking_date = $2 AND status NOT IN ('Cancelled', 'No_show')
      AND (start_time, end_time) OVERLAPS ($3, $4)
    `, [court_id, booking_date, start_time, end_time]);
    
    if (parseInt(conflict.rows[0].count) > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Horario no disponible' });
    }
    
    // Obtener tarifa de la cancha
    const courtRate = await client.query(
      'SELECT hourly_rate FROM courts WHERE id = $1',
      [court_id]
    );
    const hourlyRate = courtRate.rows[0]?.hourly_rate || 0;
    
    // Calcular horas
    const hoursDiff = (new Date(`1970-01-01T${end_time}`) - new Date(`1970-01-01T${start_time}`)) / (1000 * 60 * 60);
    const totalAmount = hourlyRate * hoursDiff;
    
    // Crear reserva
    const result = await client.query(`
      INSERT INTO bookings (customer_id, court_id, user_id, booking_date, start_time, end_time, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
      RETURNING *
    `, [customer_id, court_id, user_id, booking_date, start_time, end_time]);
    
    // Actualizar estado de la cancha a Occupied
    await client.query(
      "UPDATE courts SET status = 'Occupied' WHERE id = $1",
      [court_id]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: {
        ...result.rows[0],
        total_amount: totalAmount,
        hourly_rate: hourlyRate,
        hours: hoursDiff
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error al crear reserva' });
  } finally {
    client.release();
  }
};

// Actualizar estado de reserva
const updateBookingStatus = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'No_show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    
    await client.query('BEGIN');
    
    const result = await client.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *, (SELECT court_id FROM bookings WHERE id = $2) as court_id',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    
    // Si se cancela, liberar la cancha
    if (status === 'Cancelled' || status === 'No_show') {
      const courtId = result.rows[0].court_id;
      await client.query(
        "UPDATE courts SET status = 'Available' WHERE id = $1",
        [courtId]
      );
    }
    
    await client.query('COMMIT');
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Error al actualizar estado' });
  } finally {
    client.release();
  }
};

// Obtener reservas de un cliente
const getCustomerBookings = async (req, res) => {
  try {
    const { customerId } = req.params;
    const result = await pool.query(`
      SELECT b.*, co.court_name
      FROM bookings b
      JOIN courts co ON b.court_id = co.id
      WHERE b.customer_id = $1
      ORDER BY b.booking_date DESC, b.start_time
    `, [customerId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reservas del cliente' });
  }
};

module.exports = {
  getAllBookings,
  getBookingsByDate,
  checkAvailability,
  createBooking,
  updateBookingStatus,
  getCustomerBookings
};