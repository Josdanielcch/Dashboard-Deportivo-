// src/controllers/bookingController.js
const pool = require('../config/database');

// Obtener todas las reservas (con datos relacionados)
const getAllBookings = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.id, b.booking_date, b.start_time, b.end_time, b.status,
             c.first_name || ' ' || c.last_name as customer_name, c.phone, 
             co.court_name,
             u.username as created_by
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN courts co ON b.court_id = co.id
      LEFT JOIN users u ON b.user_id = u.id
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
             c.first_name || ' ' || c.last_name as customer_name,
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

    const bookingDateTime = new Date(`${booking_date}T${start_time}`);
    if (bookingDateTime < new Date()) {
      return res.json({ success: true, available: false, message: 'La fecha y hora deben ser posteriores al momento actual' });
    }

    const courtStatus = await pool.query('SELECT status FROM courts WHERE id = $1', [court_id]);
    if (courtStatus.rows.length === 0 || ['Maintenance', 'Out_of_service'].includes(courtStatus.rows[0].status)) {
      return res.json({ success: true, available: false, message: 'Cancha inhabilitada por mantenimiento o fuera de servicio' });
    }
    
    const result = await pool.query(`
      SELECT COUNT(*) as conflict_count
      FROM bookings
      WHERE court_id = $1 
        AND booking_date = $2
        AND status NOT IN ('Cancelled', 'No_show')
        AND (start_time, end_time) OVERLAPS ($3::time, $4::time)
    `, [court_id, booking_date, start_time, end_time]);
    
    const available = parseInt(result.rows[0].conflict_count, 10) === 0;
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
    // Use provided user_id or null (user_id is nullable in bookings)
    const bookingUserId = user_id || null;
    
    // Validaciones
    if (!customer_id || !court_id || !booking_date || !start_time || !end_time) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    // Validar fecha y hora pasada
    const bookingDateTime = new Date(`${booking_date}T${start_time}`);
    if (bookingDateTime < new Date()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No se permiten reservas en fechas u horas pasadas' });
    }

    // Validar estado de la cancha
    const courtStatus = await client.query('SELECT status FROM courts WHERE id = $1', [court_id]);
    if (courtStatus.rows.length === 0 || ['Maintenance', 'Out_of_service'].includes(courtStatus.rows[0].status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'La cancha seleccionada se encuentra en mantenimiento o fuera de servicio' });
    }
    
    // Verificar disponibilidad
    const conflict = await client.query(`
      SELECT COUNT(*) FROM bookings
      WHERE court_id = $1 AND booking_date = $2 AND status NOT IN ('Cancelled', 'No_show')
      AND (start_time, end_time) OVERLAPS ($3::time, $4::time)
    `, [court_id, booking_date, start_time, end_time]);
    
    if (parseInt(conflict.rows[0].count, 10) > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Horario no disponible' });
    }
    
    // Calcular horas (la cancha no tiene hourly_rate en DB, calculamos duración)
    const hoursDiff = (new Date(`1970-01-01T${end_time}`) - new Date(`1970-01-01T${start_time}`)) / (1000 * 60 * 60);
    
    // Crear reserva
    const result = await client.query(`
      INSERT INTO bookings (customer_id, court_id, user_id, booking_date, start_time, end_time, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
      RETURNING *
    `, [customer_id, court_id, bookingUserId, booking_date, start_time, end_time]);
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: {
        ...result.rows[0],
        total_amount: null,
        hourly_rate: 0,
        hours: hoursDiff
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error createBooking:', error);
    res.status(500).json({ error: 'Error al crear reserva', detail: error.message });
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

// Actualizar datos de reserva (fecha, hora, cancha)
const updateBooking = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { court_id, booking_date, start_time, end_time } = req.body;
    
    await client.query('BEGIN');
    
    // 1. Obtener la reserva actual
    const currentRes = await client.query('SELECT status FROM bookings WHERE id = $1', [id]);
    if (currentRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    
    // No permitir editar si ya está confirmada (facturada) o completada
    if (['Confirmed', 'Completed'].includes(currentRes.rows[0].status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No se puede editar una reserva ya cobrada/confirmada. Debe anularse y crear una nueva.' });
    }
    
    // Validar fecha y hora pasada
    const bookingDateTime = new Date(`${booking_date}T${start_time}`);
    if (bookingDateTime < new Date()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No se permiten reservas en fechas u horas pasadas' });
    }

    // Validar estado de la cancha
    const courtStatus = await client.query('SELECT status FROM courts WHERE id = $1', [court_id]);
    if (courtStatus.rows.length === 0 || ['Maintenance', 'Out_of_service'].includes(courtStatus.rows[0].status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'La cancha seleccionada se encuentra en mantenimiento o fuera de servicio' });
    }

    // 2. Verificar conflictos
    const conflict = await client.query(`
      SELECT COUNT(*) FROM bookings
      WHERE court_id = $1 
      AND booking_date = $2 
      AND id != $3
      AND status NOT IN ('Cancelled', 'No_show')
      AND (start_time, end_time) OVERLAPS ($4::time, $5::time)
    `, [court_id, booking_date, id, start_time, end_time]);
    
    if (parseInt(conflict.rows[0].count, 10) > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Horario o cancha no disponible' });
    }
    
    // 3. Actualizar reserva
    const result = await client.query(`
      UPDATE bookings 
      SET court_id = $1,
          booking_date = $2,
          start_time = $3,
          end_time = $4
      WHERE id = $5
      RETURNING *
    `, [court_id, booking_date, start_time, end_time, id]);
    
    await client.query('COMMIT');
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Error al editar la reserva' });
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
  updateBooking,
  getCustomerBookings
};