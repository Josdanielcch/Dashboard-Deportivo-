const pool = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    const weekStart = startOfWeek.toISOString().split('T')[0];

    const queries = await Promise.all([
      pool.query(`
        SELECT COUNT(*)::int as total,
               COALESCE(SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END), 0)::int as pending,
               COALESCE(SUM(CASE WHEN status = 'Confirmed' THEN 1 ELSE 0 END), 0)::int as confirmed,
               COALESCE(SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END), 0)::int as completed,
               COALESCE(SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END), 0)::int as cancelled
        FROM bookings WHERE booking_date = $1
      `, [today]),

      pool.query(`
        SELECT COALESCE(SUM(total_amount), 0)::float as today_income
        FROM billings WHERE payment_date::date = $1
      `, [today]),

      pool.query(`
        SELECT COALESCE(SUM(total_amount), 0)::float as week_income
        FROM billings WHERE payment_date::date >= $1
      `, [weekStart]),

      pool.query(`
        SELECT COALESCE(SUM(total_amount), 0)::float as month_income
        FROM billings 
        WHERE payment_date::date >= date_trunc('month', CURRENT_DATE)
      `),

      pool.query(`
        SELECT COUNT(*)::int as total_customers
        FROM customers
      `),

      pool.query(`
        SELECT COUNT(*)::int as active_courts
        FROM courts WHERE status = 'Available'
      `),

      pool.query(`
        SELECT COUNT(*)::int as total_courts
        FROM courts
      `),

      pool.query(`
        SELECT 
          COALESCE(AVG(daily_count), 0)::float as avg_daily_occupancy,
          COALESCE(MAX(daily_count), 0)::int as peak_day_count
        FROM (
          SELECT booking_date, COUNT(*)::int as daily_count
          FROM bookings 
          WHERE booking_date >= $1 
            AND status NOT IN ('Cancelled', 'No_show')
          GROUP BY booking_date
        ) sub
      `, [weekStart]),

      pool.query(`
        SELECT b.id, b.booking_date, b.start_time, b.end_time, b.status,
               c.first_name || ' ' || c.last_name as customer_name,
               co.court_name
        FROM bookings b
        JOIN customers c ON b.customer_id = c.id
        JOIN courts co ON b.court_id = co.id
        ORDER BY b.created_at DESC
        LIMIT 10
      `),

      pool.query(`
        SELECT co.court_name, COUNT(b.id)::int as booking_count
        FROM courts co
        LEFT JOIN bookings b ON b.court_id = co.id AND b.booking_date = $1
        GROUP BY co.id, co.court_name
        ORDER BY booking_count DESC
      `, [today]),

      pool.query(`
        SELECT 
          COALESCE(SUM(CASE WHEN b.status = 'Pending' THEN 1 ELSE 0 END), 0)::int as pending,
          COALESCE(SUM(CASE WHEN b.status = 'Confirmed' THEN 1 ELSE 0 END), 0)::int as confirmed,
          COALESCE(SUM(CASE WHEN b.status = 'Completed' THEN 1 ELSE 0 END), 0)::int as completed,
          COALESCE(SUM(CASE WHEN b.status = 'Cancelled' THEN 1 ELSE 0 END), 0)::int as cancelled
        FROM bookings b
        WHERE b.booking_date >= $1
      `, [weekStart]),

      pool.query(`
        SELECT to_char(b.booking_date, 'YYYY-MM-DD') as date, 
               COALESCE(SUM(bi.total_amount), 0)::float as income,
               COUNT(b.id)::int as bookings
        FROM bookings b
        LEFT JOIN billings bi ON bi.booking_id = b.id
        WHERE b.booking_date >= $1
        GROUP BY b.booking_date
        ORDER BY b.booking_date
      `, [weekStart]),

      pool.query(`
        SELECT COUNT(*)::int as this_week
        FROM bookings WHERE booking_date >= $1
      `, [weekStart]),

      pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE booking_date = $1 AND start_time <= CURRENT_TIME::time AND end_time > CURRENT_TIME::time)::int as in_progress
        FROM bookings 
        WHERE booking_date = $1 AND status IN ('Confirmed', 'Pending')
      `, [today])
    ]);

    const todayStats = queries[0].rows[0];
    const todayIncome = queries[1].rows[0].today_income;
    const weekIncome = queries[2].rows[0].week_income;
    const monthIncome = queries[3].rows[0].month_income;
    const totalCustomers = queries[4].rows[0].total_customers;
    const activeCourts = queries[5].rows[0].active_courts;
    const totalCourts = queries[6].rows[0].total_courts;
    const avgOccupancy = queries[7].rows[0].avg_daily_occupancy;
    const peakDayCount = queries[7].rows[0].peak_day_count;
    const recentBookings = queries[8].rows;
    const courtDistribution = queries[9].rows;
    const weekStatus = queries[10].rows[0];
    const dailyIncome = queries[11].rows;
    const totalWeekBookings = queries[12].rows[0].this_week;
    const inProgress = queries[13].rows[0].in_progress;

    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const incomeByDay = weekDays.map((day, i) => {
      const dayIndex = (i + 1) % 7;
      const todayDay = new Date().getDay();
      const diff = dayIndex - todayDay;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + diff);
      const dateStr = targetDate.toISOString().split('T')[0];
      const found = dailyIncome.find(d => d.date === dateStr);
      return {
        day,
        date: dateStr,
        amount: found ? found.income : 0,
        bookings: found ? found.bookings : 0,
        isToday: diff === 0
      };
    });

    const maxIncome = Math.max(...incomeByDay.map(d => d.amount), 1);
    const totalWeekIncome = incomeByDay.reduce((acc, d) => acc + d.amount, 0);
    const avgDailyIncome = totalWeekIncome / 7;

    res.json({
      success: true,
      data: {
        today: {
          total: todayStats.total,
          pending: todayStats.pending,
          confirmed: todayStats.confirmed,
          completed: todayStats.completed,
          cancelled: todayStats.cancelled,
          income: todayIncome,
          inProgress
        },
        week: {
          income: weekIncome,
          totalBookings: totalWeekBookings,
          pending: weekStatus.pending,
          confirmed: weekStatus.confirmed,
          completed: weekStatus.completed,
          cancelled: weekStatus.cancelled
        },
        month: { income: monthIncome },
        customers: { total: totalCustomers },
        courts: {
          active: activeCourts,
          total: totalCourts,
          occupancy: totalCourts > 0 ? Math.round((activeCourts / totalCourts) * 100) : 0
        },
        occupancy: {
          avgDaily: Math.round(avgOccupancy),
          peakDay: peakDayCount
        },
        incomeByDay,
        weeklyStats: {
          total: totalWeekIncome,
          avg: Math.round(avgDailyIncome),
          max: Math.max(...incomeByDay.map(d => d.amount)),
          bestDay: incomeByDay.reduce((best, d) => d.amount > best.amount ? d : best, incomeByDay[0])
        },
        courtDistribution,
        recentBookings
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

module.exports = { getDashboardStats };
