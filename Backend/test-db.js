// test-db.js
require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
    console.log('🔍 Probando conexión a Neon.tech...');
    console.log('📝 Usando DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada');
    
    if (!process.env.DATABASE_URL) {
        console.error('❌ Error: DATABASE_URL no está definida en .env');
        console.log('💡 Asegúrate de tener: DATABASE_URL=postgresql://...');
        return;
    }
    
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    
    try {
        const client = await pool.connect();
        console.log('✅ Conexión exitosa a PostgreSQL (Neon.tech)!');
        
        // Probar una consulta simple
        const result = await client.query('SELECT NOW() as hora_actual, version() as version_postgres');
        console.log('📊 Hora actual en DB:', result.rows[0].hora_actual);
        console.log('🐘 Versión PostgreSQL:', result.rows[0].version_postgres);
        
        // Verificar tablas existentes
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        console.log('\n📋 Tablas en tu base de datos:');
        if (tables.rows.length === 0) {
            console.log('   ⚠️ No hay tablas aún. Necesitas crear el esquema.');
        } else {
            tables.rows.forEach(row => {
                console.log(`   - ${row.table_name}`);
            });
        }
        
        client.release();
        await pool.end();
        
        console.log('\n🎉 Conexión verificada correctamente!');
        console.log('💡 Ahora puedes ejecutar: npm run dev');
        
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        console.log('\n🔧 Posibles soluciones:');
        
        if (error.message.includes('no pg_hba.conf entry')) {
            console.log('   - Verifica que la IP esté permitida en Neon');
        } else if (error.message.includes('password authentication failed')) {
            console.log('   - La contraseña es incorrecta. Revisa tu .env');
        } else if (error.message.includes('getaddrinfo')) {
            console.log('   - El host no es correcto. Revisa la URL de conexión');
        } else if (error.message.includes('timeout')) {
            console.log('   - Problema de red. Verifica tu conexión a Internet');
        }
    }
}

testConnection();