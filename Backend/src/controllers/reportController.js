const pool = require('../config/database');

const salesByDate = async (req, res) => {
  try {
    const { start_date, end_date, group_by = 'day' } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date y end_date son requeridos' });
    }

    let result;

    if (group_by === 'week') {
      result = await pool.query(`
        WITH periods AS (
          SELECT DATE_TRUNC('week', d::date)::text AS period
          FROM generate_series($1::date, $2::date, '1 week'::interval) d
        ),
        data AS (
          SELECT DATE_TRUNC('week', b.payment_date)::text AS period,
                 b.id AS billing_id,
                 b.total_amount,
                 b.booking_id
          FROM billings b
          WHERE b.payment_date >= $1 AND b.payment_date < ($2::date + INTERVAL '1 day')
        )
        SELECT p.period,
               COUNT(d.billing_id) AS count,
               COALESCE(SUM(d.total_amount), 0) AS total,
               COALESCE(SUM(CASE WHEN d.booking_id IS NOT NULL THEN d.total_amount ELSE 0 END), 0) AS booking_revenue,
               COALESCE(SUM(CASE WHEN d.booking_id IS NULL THEN d.total_amount ELSE 0 END), 0) AS product_revenue
        FROM periods p
        LEFT JOIN data d ON p.period = d.period
        GROUP BY p.period
        ORDER BY p.period
      `, [start_date, end_date]);
    } else if (group_by === 'month') {
      result = await pool.query(`
        WITH periods AS (
          SELECT DATE_TRUNC('month', d::date)::text AS period
          FROM generate_series($1::date, $2::date, '1 month'::interval) d
        ),
        data AS (
          SELECT DATE_TRUNC('month', b.payment_date)::text AS period,
                 b.id AS billing_id,
                 b.total_amount,
                 b.booking_id
          FROM billings b
          WHERE b.payment_date >= $1 AND b.payment_date < ($2::date + INTERVAL '1 day')
        )
        SELECT p.period,
               COUNT(d.billing_id) AS count,
               COALESCE(SUM(d.total_amount), 0) AS total,
               COALESCE(SUM(CASE WHEN d.booking_id IS NOT NULL THEN d.total_amount ELSE 0 END), 0) AS booking_revenue,
               COALESCE(SUM(CASE WHEN d.booking_id IS NULL THEN d.total_amount ELSE 0 END), 0) AS product_revenue
        FROM periods p
        LEFT JOIN data d ON p.period = d.period
        GROUP BY p.period
        ORDER BY p.period
      `, [start_date, end_date]);
    } else {
      result = await pool.query(`
        WITH periods AS (
          SELECT d::date::text AS period
          FROM generate_series($1::date, $2::date, '1 day'::interval) d
        ),
        data AS (
          SELECT DATE(b.payment_date)::text AS period,
                 b.id AS billing_id,
                 b.total_amount,
                 b.booking_id
          FROM billings b
          WHERE b.payment_date >= $1 AND b.payment_date < ($2::date + INTERVAL '1 day')
        )
        SELECT p.period,
               COUNT(d.billing_id) AS count,
               COALESCE(SUM(d.total_amount), 0) AS total,
               COALESCE(SUM(CASE WHEN d.booking_id IS NOT NULL THEN d.total_amount ELSE 0 END), 0) AS booking_revenue,
               COALESCE(SUM(CASE WHEN d.booking_id IS NULL THEN d.total_amount ELSE 0 END), 0) AS product_revenue
        FROM periods p
        LEFT JOIN data d ON p.period = d.period
        GROUP BY p.period
        ORDER BY p.period
      `, [start_date, end_date]);
    }

    const summary = await pool.query(`
      SELECT COUNT(*) AS total_count,
             COALESCE(SUM(total_amount), 0) AS total_revenue,
             COALESCE(AVG(total_amount), 0) AS avg_amount
      FROM billings
      WHERE payment_date >= $1 AND payment_date < ($2::date + INTERVAL '1 day')
    `, [start_date, end_date]);

    res.json({
      success: true,
      data: {
        series: result.rows,
        summary: summary.rows[0]
      }
    });
  } catch (error) {
    console.error('Error en salesByDate:', error.message);
    res.status(500).json({ error: 'Error al generar reporte de ventas' });
  }
};

const topProducts = async (req, res) => {
  try {
    const { start_date, end_date, limit = 10 } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date y end_date son requeridos' });
    }

    const result = await pool.query(`
      SELECT p.id,
             p.product_name,
             COALESCE(SUM(sd.quantity), 0) AS total_sold,
             COALESCE(SUM(sd.subtotal), 0) AS total_revenue,
             COALESCE(AVG(sd.price_unit), 0) AS avg_price,
             COALESCE(SUM(sd.quantity * COALESCE(sd.cost_price_at_sale, p.cost_price, 0)), 0) AS total_cost,
             COALESCE(SUM(sd.subtotal) - SUM(sd.quantity * COALESCE(sd.cost_price_at_sale, p.cost_price, 0)), 0) AS gross_profit,
             CASE 
               WHEN SUM(sd.quantity * COALESCE(sd.cost_price_at_sale, p.cost_price, 0)) > 0 
               THEN ROUND(((SUM(sd.subtotal) - SUM(sd.quantity * COALESCE(sd.cost_price_at_sale, p.cost_price, 0))) / SUM(sd.quantity * COALESCE(sd.cost_price_at_sale, p.cost_price, 0))) * 100, 2)
               ELSE 0 
             END AS profit_margin_percent,
             CASE 
               WHEN SUM(sd.subtotal) > 0 
               THEN ROUND(((SUM(sd.subtotal) - SUM(sd.quantity * COALESCE(sd.cost_price_at_sale, p.cost_price, 0))) / SUM(sd.subtotal)) * 100, 2)
               ELSE 0 
             END AS margin_on_sale_percent
      FROM sale_details sd
      JOIN products p ON sd.products_id = p.id
      JOIN billings b ON sd.billing_id = b.id
      WHERE b.payment_date >= $1 AND b.payment_date < ($2::date + INTERVAL '1 day')
      GROUP BY p.id, p.product_name
      ORDER BY total_sold DESC
      LIMIT $3
    `, [start_date, end_date, parseInt(limit)]);

    const totalSold = result.rows.reduce((acc, r) => acc + parseInt(r.total_sold), 0);
    const totalRevenue = result.rows.reduce((acc, r) => acc + parseFloat(r.total_revenue), 0);
    const totalCost = result.rows.reduce((acc, r) => acc + parseFloat(r.total_cost || 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const overallMargin = totalCost > 0 ? Number(((totalProfit / totalCost) * 100).toFixed(2)) : 0;

    res.json({
      success: true,
      data: {
        products: result.rows,
        totalSold,
        totalRevenue,
        totalCost,
        totalProfit,
        overallMargin
      }
    });
  } catch (error) {
    console.error('Error en topProducts:', error.message);
    res.status(500).json({ error: 'Error al generar reporte de productos' });
  }
};

const revenueByCourt = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date y end_date son requeridos' });
    }

    const result = await pool.query(`
      SELECT c.id,
             c.court_name,
             s.name AS sport_name,
             COUNT(b.id) AS total_bookings,
             COALESCE(SUM(b.total_amount), 0) AS total_revenue,
             COALESCE(AVG(b.total_amount), 0) AS avg_per_booking
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      LEFT JOIN sports s ON c.sport_id = s.id
      WHERE b.booking_date >= $1 AND b.booking_date <= $2
        AND b.status IN ('Confirmed', 'Completed')
      GROUP BY c.id, c.court_name, s.name
      ORDER BY total_revenue DESC
    `, [start_date, end_date]);

    const totalRevenue = result.rows.reduce((acc, r) => acc + parseFloat(r.total_revenue), 0);

    res.json({
      success: true,
      data: {
        courts: result.rows,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Error en revenueByCourt:', error.message);
    res.status(500).json({ error: 'Error al generar reporte por canchas' });
  }
};

const bookingReport = async (req, res) => {
  try {
    const { start_date, end_date, status } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date y end_date son requeridos' });
    }

    let whereClause = `b.booking_date >= $1 AND b.booking_date <= $2`;
    const params = [start_date, end_date];

    if (status) {
      whereClause += ` AND b.status = $3`;
      params.push(status);
    }

    const statusCounts = await pool.query(`
      SELECT b.status, COUNT(*) AS count
      FROM bookings b
      WHERE ${whereClause}
      GROUP BY b.status
      ORDER BY count DESC
    `, params);

    const hourlyDistribution = await pool.query(`
      SELECT EXTRACT(HOUR FROM b.start_time)::int AS hour,
             COUNT(*) AS count
      FROM bookings b
      WHERE ${whereClause}
      GROUP BY hour
      ORDER BY hour
    `, params);

    const byCourt = await pool.query(`
      SELECT c.court_name,
             b.status,
             COUNT(*) AS count
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      WHERE ${whereClause}
      GROUP BY c.court_name, b.status
      ORDER BY c.court_name, count DESC
    `, params);

    const totalBookings = statusCounts.rows.reduce((acc, r) => acc + parseInt(r.count), 0);

    res.json({
      success: true,
      data: {
        statusCounts: statusCounts.rows,
        hourlyDistribution: hourlyDistribution.rows,
        byCourt: byCourt.rows,
        totalBookings
      }
    });
  } catch (error) {
    console.error('Error en bookingReport:', error.message);
    res.status(500).json({ error: 'Error al generar reporte de reservas' });
  }
};

const topCustomers = async (req, res) => {
  try {
    const { start_date, end_date, limit = 10 } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date y end_date son requeridos' });
    }

    const result = await pool.query(`
      SELECT cu.id,
             cu.first_name || ' ' || cu.last_name AS customer_name,
             cu.email,
             cu.phone,
             COUNT(DISTINCT b.id) AS total_bookings,
             COALESCE(SUM(b.total_amount), 0) AS total_spent,
             COALESCE(AVG(b.total_amount), 0) AS avg_spent
      FROM bookings b
      JOIN customers cu ON b.customer_id = cu.id
      WHERE b.booking_date >= $1 AND b.booking_date <= $2
        AND b.status IN ('Confirmed', 'Completed')
      GROUP BY cu.id, cu.first_name, cu.last_name, cu.email, cu.phone
      ORDER BY total_bookings DESC
      LIMIT $3
    `, [start_date, end_date, parseInt(limit)]);

    const totalCustomers = result.rows.length;
    const totalRevenue = result.rows.reduce((acc, r) => acc + parseFloat(r.total_spent), 0);

    res.json({
      success: true,
      data: {
        customers: result.rows,
        totalCustomers,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Error en topCustomers:', error.message);
    res.status(500).json({ error: 'Error al generar reporte de clientes' });
  }
};

const courtUtilization = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date y end_date son requeridos' });
    }

    const result = await pool.query(`
      SELECT c.id,
             c.court_name,
             s.name AS sport_name,
             c.hourly_rate,
             COUNT(b.id) AS total_bookings,
             COALESCE(SUM(
               EXTRACT(EPOCH FROM (b.end_time - b.start_time)) / 3600
             ), 0) AS total_hours_booked,
             COALESCE(SUM(b.total_amount), 0) AS total_revenue
      FROM courts c
      LEFT JOIN bookings b ON b.court_id = c.id
        AND b.booking_date >= $1 AND b.booking_date <= $2
        AND b.status IN ('Confirmed', 'Completed')
      LEFT JOIN sports s ON c.sport_id = s.id
      GROUP BY c.id, c.court_name, s.name, c.hourly_rate
      ORDER BY total_hours_booked DESC
    `, [start_date, end_date]);

    const totalHours = result.rows.reduce((acc, r) => acc + parseFloat(r.total_hours_booked), 0);
    const totalRevenue = result.rows.reduce((acc, r) => acc + parseFloat(r.total_revenue), 0);

    res.json({
      success: true,
      data: {
        courts: result.rows,
        totalHours,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Error en courtUtilization:', error.message);
    res.status(500).json({ error: 'Error al generar reporte de ocupación' });
  }
};

const summary = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date y end_date son requeridos' });
    }

    const sales = await pool.query(`
      SELECT COUNT(*) AS total_sales,
             COALESCE(SUM(total_amount), 0) AS total_revenue,
             COALESCE(AVG(total_amount), 0) AS avg_sale
      FROM billings
      WHERE payment_date >= $1 AND payment_date < ($2::date + INTERVAL '1 day')
    `, [start_date, end_date]);

    const bookings = await pool.query(`
      SELECT COUNT(*) AS total_bookings,
             COUNT(*) FILTER (WHERE status = 'Confirmed') AS confirmed,
             COUNT(*) FILTER (WHERE status = 'Completed') AS completed,
             COUNT(*) FILTER (WHERE status = 'Cancelled') AS cancelled,
             COUNT(*) FILTER (WHERE status = 'Pending') AS pending
      FROM bookings
      WHERE booking_date >= $1 AND booking_date <= $2
    `, [start_date, end_date]);

    const customers = await pool.query(`
      SELECT COUNT(DISTINCT customer_id) AS active_customers
      FROM bookings
      WHERE booking_date >= $1 AND booking_date <= $2
        AND status IN ('Confirmed', 'Completed')
    `, [start_date, end_date]);

    const products = await pool.query(`
      SELECT COALESCE(SUM(sd.subtotal), 0) AS product_revenue,
             COALESCE(SUM(sd.quantity), 0) AS products_sold,
             COALESCE(SUM(sd.quantity * COALESCE(sd.cost_price_at_sale, p.cost_price, 0)), 0) AS product_cost,
             COALESCE(SUM(sd.subtotal) - SUM(sd.quantity * COALESCE(sd.cost_price_at_sale, p.cost_price, 0)), 0) AS product_profit
      FROM sale_details sd
      JOIN products p ON sd.products_id = p.id
      JOIN billings b ON sd.billing_id = b.id
      WHERE b.payment_date >= $1 AND b.payment_date < ($2::date + INTERVAL '1 day')
    `, [start_date, end_date]);

    const bookingRevenue = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) AS booking_revenue
      FROM bookings
      WHERE booking_date >= $1 AND booking_date <= $2
        AND status IN ('Confirmed', 'Completed')
    `, [start_date, end_date]);

    res.json({
      success: true,
      data: {
        sales: sales.rows[0],
        bookings: bookings.rows[0],
        customers: customers.rows[0],
        products: products.rows[0],
        bookingRevenue: bookingRevenue.rows[0].booking_revenue
      }
    });
  } catch (error) {
    console.error('Error en summary:', error.message);
    res.status(500).json({ error: 'Error al generar resumen' });
  }
};

module.exports = {
  salesByDate,
  topProducts,
  revenueByCourt,
  bookingReport,
  topCustomers,
  courtUtilization,
  summary
};
