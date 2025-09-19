const mysql = require('mysql2/promise'); // pool con Promises
const mysqlCore = require('mysql2');     // utilidades para escape/format
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

// Log útil
console.log('DB cfg =>', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  name: process.env.DB_NAME,
  hasPass: !!process.env.DB_PASSWORD
});

// === Wrapper 100% compatible: callback y promise ===
const db = {
  // db.query(sql, params?, cb?)
  query(sql, params, cb) {
    // Soporta db.query(sql, cb)
    if (typeof params === 'function') {
      cb = params;
      params = [];
    }
    if (params === undefined || params === null) params = [];

    if (typeof cb === 'function') {
      pool.query(sql, params)
        .then(([rows, fields]) => cb(null, rows, fields))
        .catch(err => cb(err));
      return; // no devolver Promise si usas callback
    } else {
      return pool.query(sql, params); // Promise<[rows, fields]>
    }
  },

  // db.execute(sql, params?, cb?)  (por si en algún lugar usas execute)
  execute(sql, params, cb) {
    if (typeof params === 'function') {
      cb = params;
      params = [];
    }
    if (params === undefined || params === null) params = [];

    if (typeof cb === 'function') {
      pool.execute(sql, params)
        .then(([rows, fields]) => cb(null, rows, fields))
        .catch(err => cb(err));
      return;
    } else {
      return pool.execute(sql, params);
    }
  },

  // Transacciones: Promise o callback
  getConnection(cb) {
    if (typeof cb === 'function') {
      pool.getConnection()
        .then(conn => cb(null, conn))
        .catch(err => cb(err));
      return;
    }
    return pool.getConnection(); // Promise<PoolConnection>
  },

  // Compat para código que hace db.promise().query(...)
  promise() {
    return db;
  },

  // Utilidades por si las usas en algún lado
  escape: mysqlCore.escape,
  format: mysqlCore.format,
};

// Verificación inicial
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Conexión establecida con la base de datos MySQL');
    conn.release();
  } catch (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message);
  }
})();

module.exports = db;
