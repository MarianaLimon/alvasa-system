const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const clientesRoutes = require('./routes/clientes');
const cotizacionesRoutes = require('./routes/cotizaciones');
const itemsCotizacionRoutes = require('./routes/itemsCotizacion');
const costosAdicionalesRoutes = require('./routes/costosAdicionales');

const app = express();
const port = 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.use(express.json());
app.use(cors());

// Usar las rutas
app.use('/clientes', clientesRoutes);
app.use('/cotizaciones', cotizacionesRoutes);
app.use('/items-cotizacion', itemsCotizacionRoutes);
app.use('/costos-adicionales', costosAdicionalesRoutes);

// Ruta básica
app.get('/', (req, res) => {
  res.send('¡Hola desde el backend de ALVASA-SYSTEM!');
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});