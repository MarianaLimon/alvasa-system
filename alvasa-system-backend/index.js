const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const clientesRoutes = require('./routes/clientes');
const cotizacionesRoutes = require('./routes/cotizaciones');

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Rutas
app.use('/clientes', clientesRoutes);
app.use('/cotizaciones', cotizacionesRoutes);

// Ruta básica
app.get('/', (req, res) => {
  res.send('¡Hola desde el backend de ALVASA-SYSTEM!');
});

// Iniciar servidor (solo una vez)
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});