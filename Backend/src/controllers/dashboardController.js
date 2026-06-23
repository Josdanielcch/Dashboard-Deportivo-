// src/controllers/dashboardController.js
const pool = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    const statsData = {};

    // 1. Reservas Hoy
    const today = new Date().toISOString().split('T')[0];
    const reservasHoyQuery = await pool.query(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE booking_date = $1 AND status != 'Cancelled'
    `, [today]);
    statsData.reservasHoy = parseInt(reservasHoyQuery.rows[0].count, 10);

    // 2. Ingresos Totales
    const ingresosQuery = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total 
      FROM billings
    `);
    statsData.ingresos = parseFloat(ingresosQuery.rows[0].total);

    // 3. Clientes Activos
    const clientesQuery = await pool.query(`
      SELECT COUNT(*) as count 
      FROM customers
    `);
    statsData.clientesActivos = parseInt(clientesQuery.rows[0].count, 10);

    // 4. Ocupación Hoy (Estimada)
    const courtsQuery = await pool.query(`SELECT COUNT(*) as count FROM courts WHERE status = 'Available'`);
    const totalCourts = parseInt(courtsQuery.rows[0].count, 10);
    const totalSlots = totalCourts * 14; 
    let ocupacion = 0;
    if (totalSlots > 0) {
      ocupacion = Math.round((statsData.reservasHoy / totalSlots) * 100);
      if (ocupacion > 100) ocupacion = 100;
    }
    statsData.ocupacion = ocupacion;

    // --- NUEVAS ESTADÍSTICAS ---
    
    // Gastos Totales (Compras)
    const gastosQuery = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total 
      FROM purchases
    `);
    statsData.gastosTotales = parseFloat(gastosQuery.rows[0].total);

    // CxC Pendiente (Deuda de clientes)
    const cxcQuery = await pool.query(`
      SELECT COALESCE(SUM(balance), 0) as total 
      FROM accounts_receivable
      WHERE status != 'Pagado'
    `);
    statsData.cxcPendiente = parseFloat(cxcQuery.rows[0].total);

    // CxP Pendiente (Deuda a proveedores)
    const cxpQuery = await pool.query(`
      SELECT COALESCE(SUM(balance), 0) as total 
      FROM accounts_payable
      WHERE status != 'Pagada'
    `);
    statsData.cxpPendiente = parseFloat(cxpQuery.rows[0].total);

    // Proveedores Activos
    const proveedoresQuery = await pool.query(`
      SELECT COUNT(*) as count 
      FROM suppliers
      WHERE status = 'Active'
    `);
    statsData.proveedoresActivos = parseInt(proveedoresQuery.rows[0].count, 10);


    // 5. Sports Distribution (Agrupar por court_name)
    const sportsQuery = await pool.query(`
      SELECT c.court_name, COUNT(b.id) as count
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      WHERE b.status != 'Cancelled'
      GROUP BY c.court_name
    `);
    
    // Asignamos colores según el índice para mantener la paleta
    const colors = ['bg-[#ccff00]', 'bg-blue-400', 'bg-purple-400', 'bg-orange-400', 'bg-emerald-400'];
    const shadows = ['shadow-[#ccff00]/20', 'shadow-blue-400/20', 'shadow-purple-400/20', 'shadow-orange-400/20', 'shadow-emerald-400/20'];
    
    let totalDistrib = 0;
    const sportsRaw = sportsQuery.rows.map(row => {
      const count = parseInt(row.count, 10);
      totalDistrib += count;
      return {
        name: row.court_name,
        count: count
      };
    });

    statsData.sportsDistribution = sportsRaw.map((item, index) => {
      const percentage = totalDistrib > 0 ? Math.round((item.count / totalDistrib) * 100) : 0;
      return {
        name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
        value: percentage,
        color: colors[index % colors.length],
        shadow: shadows[index % shadows.length]
      };
    });

    // 6. Weekly Income
    const weekIncomeQuery = await pool.query(`
      SELECT DATE(payment_date) as date, SUM(total_amount) as total
      FROM billings
      WHERE payment_date >= current_date - interval '7 days'
      GROUP BY DATE(payment_date)
      ORDER BY DATE(payment_date) ASC
    `);
    
    const weekDays = [];
    const daysName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    let maxAmount = 0;

    for(let i=6; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      // Ajustar zona horaria local a YYYY-MM-DD
      const localDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
      const dateStr = localDate.toISOString().split('T')[0];
      
      const found = weekIncomeQuery.rows.find(r => {
        // En base de datos puede venir como Date object
        const rDate = new Date(r.date);
        return rDate.toISOString().split('T')[0] === dateStr;
      });
      
      const amount = found ? parseFloat(found.total) : 0;
      if (amount > maxAmount) maxAmount = amount;

      weekDays.push({
        day: daysName[d.getDay()],
        amount: amount,
        height: 0 // Se calculará abajo
      });
    }

    // Calcular alturas proporcionales para el gráfico
    statsData.weekIncome = weekDays.map(item => ({
      ...item,
      height: maxAmount > 0 ? Math.max(10, Math.round((item.amount / maxAmount) * 100)) : 10
    }));

    // 7. Recent Bookings
    const recentBookingsQuery = await pool.query(`
      SELECT b.id, c.first_name || ' ' || COALESCE(c.last_name, '') as customer_name, co.court_name, b.start_time, b.status
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN courts co ON b.court_id = co.id
      ORDER BY b.id DESC
      LIMIT 5
    `);
    statsData.recentBookings = recentBookingsQuery.rows.map(row => {
      let estado = 'Pendiente';
      if (row.status === 'Confirmed') estado = 'Confirmada';
      else if (row.status === 'Cancelled') estado = 'Cancelada';
      else if (row.status === 'No_show') estado = 'No asiste';
      else if (row.status === 'Completed') estado = 'Completada';
      
      return {
        cliente: row.customer_name.trim(),
        cancha: row.court_name,
        hora: row.start_time.slice(0, 5),
        estado: estado
      };
    });

    res.json({ success: true, data: statsData });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Error fetching dashboard stats' });
  }
};

module.exports = {
  getDashboardStats
};
