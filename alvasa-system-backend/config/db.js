const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',      // La dirección de tu base de datos (en este caso, localhost)
  user: 'root',           // Tu usuario de MySQL
  password: 'ojitoS15.92', // Tu contraseña de MySQL
  database: 'alvasa_system' // El nombre de tu base de datos
});

// Verificación de la conexión
connection.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
    return;
  }
  console.log('✅ Conectado a la base de datos MySQL');
});

// Exporta la conexión para usarla en otros archivos
module.exports = connection;