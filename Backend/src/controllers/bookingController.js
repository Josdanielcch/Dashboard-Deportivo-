// src/controllers/bookingController.js
const pool = require('../config/database');
const mailer = require('../config/mailer');

// Obtener todas las reservas (con datos relacionados)
const getAllBookings = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.id, b.booking_date, b.start_time, b.end_time, b.status, b.customer_id,
             c.first_name || ' ' || c.last_name as customer_name, c.phone, 
             co.court_name, co.hourly_rate,
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

    // Crear fechas en la zona horaria local (-04:00)
    const bookingDateTime = new Date(`${booking_date}T${start_time}-04:00`);
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
    const bookingDateTime = new Date(`${booking_date}T${start_time}-04:00`);
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
    
    // --- LÓGICA ANTI-SPAM: Máximo 3 reservas pendientes ---
    const pendingBookings = await client.query(`
      SELECT COUNT(*) as pending_count 
      FROM bookings 
      WHERE customer_id = $1 AND status = 'Pending'
    `, [customer_id]);
    
    if (parseInt(pendingBookings.rows[0].pending_count, 10) >= 3) {
      await client.query('ROLLBACK');
      return res.status(429).json({ error: 'Has alcanzado el límite de 3 reservas sin pagar. Por favor, realiza el pago de tus reservas pendientes o asiste a las mismas antes de agendar una nueva.' });
    }
    // --------------------------------------------------------
    
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
    
    // Emitir evento Socket.IO para notificar al dashboard
    try {
      const io = req.app.get('io');
      if (io) {
        const newBookingData = await pool.query(`
          SELECT b.*, c.first_name || ' ' || c.last_name as customer_name, co.court_name
          FROM bookings b
          JOIN customers c ON b.customer_id = c.id
          JOIN courts co ON b.court_id = co.id
          WHERE b.id = $1
        `, [result.rows[0].id]);
        
        if (newBookingData.rows.length > 0) {
          io.to('dashboard').emit('new-booking', {
            id: newBookingData.rows[0].id,
            customer_name: newBookingData.rows[0].customer_name,
            court_name: newBookingData.rows[0].court_name,
            start_time: newBookingData.rows[0].start_time,
            end_time: newBookingData.rows[0].end_time,
            created_at: new Date().toISOString()
          });
        }
      }
    } catch (socketError) {
      console.error('Error emitiendo socket event:', socketError);
    }
    
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
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
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
    
    // Enviar correo si la reserva fue confirmada
    if (status === 'Confirmed') {
      try {
        const bookingDetails = await pool.query(`
          SELECT b.booking_date, b.start_time, b.end_time,
                 c.first_name, c.email,
                 co.court_name
          FROM bookings b
          JOIN customers c ON b.customer_id = c.id
          JOIN courts co ON b.court_id = co.id
          WHERE b.id = $1
        `, [id]);
        
        if (bookingDetails.rows.length > 0) {
          const detail = bookingDetails.rows[0];
          
          // Formatear la fecha para que se vea bonita (evita problemas de zona horaria si la tratamos como string directamente)
          // El booking_date viene de postgres, si es un objeto Date, toLocaleDateString() funciona bien.
          let fechaFormateada = detail.booking_date;
          if (detail.booking_date instanceof Date) {
            fechaFormateada = detail.booking_date.toLocaleDateString('es-VE');
          } else if (typeof detail.booking_date === 'string') {
            fechaFormateada = detail.booking_date.split('T')[0];
          }

          const formatAMPM = (timeStr) => {
            if (!timeStr) return '';
            const parts = timeStr.split(':');
            if (parts.length >= 2) {
              let h = parseInt(parts[0], 10);
              const m = parts[1];
              const ampm = h >= 12 ? 'PM' : 'AM';
              h = h % 12;
              h = h ? h : 12;
              return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
            }
            return timeStr;
          };

          const cleanStart = formatAMPM(detail.start_time);
          const cleanEnd = formatAMPM(detail.end_time);

          const mailOptions = {
            from: '"CourtConnect" <no-reply@courtconnect.com>',
            to: detail.email,
            subject: '¡Tu reserva ha sido confirmada! 🎉',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #4CAF50;">¡Reserva Confirmada!</h2>
                <p>Hola <strong>${detail.first_name}</strong>,</p>
                <p>¡Tenemos excelentes noticias! Tu reserva ha sido aprobada y confirmada con éxito por la administración.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                  <h3 style="margin-top: 0; color: #555;">Detalles de tu reserva:</h3>
                  <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 8px;">📍 <strong>Cancha:</strong> ${detail.court_name}</li>
                    <li style="margin-bottom: 8px;">📅 <strong>Fecha:</strong> ${fechaFormateada}</li>
                    <li style="margin-bottom: 8px;">⏰ <strong>Horario:</strong> ${cleanStart} a ${cleanEnd}</li>
                  </ul>
                </div>
                
                <p>Te esperamos con los brazos abiertos. ¡Prepárate para jugar!</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #888; text-align: center;">Atentamente,<br>El equipo de CourtConnect</p>
              </div>
            `
          };
          
          await mailer.sendMail(mailOptions);
        }
      } catch (mailError) {
        console.error('Error enviando correo de confirmación:', mailError);
        // No devolvemos error al cliente web si el correo falla, la reserva ya está confirmada.
      }
    } else if (status === 'Cancelled') {
      try {
        const bookingDetails = await pool.query(`
          SELECT b.booking_date, b.start_time, b.end_time,
                 c.first_name, c.email,
                 co.court_name
          FROM bookings b
          JOIN customers c ON b.customer_id = c.id
          JOIN courts co ON b.court_id = co.id
          WHERE b.id = $1
        `, [id]);
        
        if (bookingDetails.rows.length > 0) {
          const detail = bookingDetails.rows[0];
          
          let fechaFormateada = detail.booking_date;
          if (detail.booking_date instanceof Date) {
            fechaFormateada = detail.booking_date.toLocaleDateString('es-VE');
          } else if (typeof detail.booking_date === 'string') {
            fechaFormateada = detail.booking_date.split('T')[0];
          }

          const formatAMPM = (timeStr) => {
            if (!timeStr) return '';
            const parts = timeStr.split(':');
            if (parts.length >= 2) {
              let h = parseInt(parts[0], 10);
              const m = parts[1];
              const ampm = h >= 12 ? 'PM' : 'AM';
              h = h % 12;
              h = h ? h : 12;
              return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
            }
            return timeStr;
          };

          const cleanStart = formatAMPM(detail.start_time);

          const mailOptions = {
            from: '"CourtConnect" <no-reply@courtconnect.com>',
            to: detail.email,
            subject: 'Actualización sobre tu reserva en CourtConnect ⚠️',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2 style="color: #E53935;">Aviso de Cancelación</h2>
                <p>Hola <strong>${detail.first_name}</strong>,</p>
                <p>Lamentablemente, hemos tenido que cancelar tu solicitud de reserva para la cancha <strong>${detail.court_name}</strong> el día <strong>${fechaFormateada}</strong> a las <strong>${cleanStart}</strong>.</p>
                
                <div style="background-color: #ffebee; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #E53935;">
                  <p style="margin: 0; color: #b71c1c;">Esto suele ocurrir por cruces de horarios de último minuto o mantenimiento inesperado de las instalaciones. Te pedimos una sincera disculpa por el inconveniente.</p>
                </div>
                
                <p>Las buenas noticias son que tenemos muchas otras canchas y horarios disponibles. ¡Te invitamos a buscar un nuevo turno para tu partido!</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #888; text-align: center;">Atentamente,<br>El equipo de CourtConnect</p>
              </div>
            `
          };
          
          await mailer.sendMail(mailOptions);
        }
      } catch (mailError) {
        console.error('Error enviando correo de cancelación:', mailError);
      }
    }

    // Emitir evento Socket.IO para notificar cambio de estado
    try {
      const io = req.app.get('io');
      if (io) {
        const statusData = await pool.query(`
          SELECT b.*, c.first_name || ' ' || c.last_name as customer_name, co.court_name
          FROM bookings b
          JOIN customers c ON b.customer_id = c.id
          JOIN courts co ON b.court_id = co.id
          WHERE b.id = $1
        `, [id]);
        
        if (statusData.rows.length > 0) {
          io.to('dashboard').emit('booking-status-changed', {
            id: statusData.rows[0].id,
            status,
            customer_name: statusData.rows[0].customer_name,
            court_name: statusData.rows[0].court_name
          });
        }
      }
    } catch (socketError) {
      console.error('Error emitiendo socket status event:', socketError);
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in updateBookingStatus:', error);
    res.status(500).json({ error: 'Error al actualizar estado', detail: error.message });
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
      SELECT b.*, co.court_name, s.name as sport_name, s.image_url as sport_image
      FROM bookings b
      JOIN courts co ON b.court_id = co.id
      LEFT JOIN sports s ON co.sport_id = s.id
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