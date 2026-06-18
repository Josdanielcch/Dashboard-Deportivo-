const { pool } = require('./src/config/db'); pool.query('SELECT * FROM bookings LIMIT 1').then(res => {console.log(res.rows); process.exit(0)});
