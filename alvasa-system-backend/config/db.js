const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'alvasa_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

// ⬇ Log temporal solo para verificar
console.log('DB cfg =>', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  name: process.env.DB_NAME,
  hasPass: !!process.env.DB_PASSWORD
});

// Verificación inicial
pool.getConnection((err, conn) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message);
  } else {
    console.log('✅ Conexión establecida con la base de datos MySQL');
    conn.release();
  }
});

module.exports = pool;