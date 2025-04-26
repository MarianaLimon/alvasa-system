const express = require('express');
const cors = require('cors');
const db = require('./config/db');

// Importar rutas
const clientesRoutes = require('./routes/clientes');
const cotizacionesRoutes = require('./routes/cotizaciones');
const cargosRoutes = require('./routes/cargos'); 
const serviciosRoutes = require('./routes/servicios');
const cuentaGastosRoutes = require('./routes/cuentaGastos');
const pedimentosRoutes = require('./routes/pedimentos');
const desgloseImpuestosRoutes = require('./routes/desgloseImpuestos');

const app = express();
const port = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Usar rutas
app.use('/clientes', clientesRoutes);
app.use('/cotizaciones', cotizacionesRoutes);
app.use('/cargos', cargosRoutes); 
app.use('/servicios', serviciosRoutes);
app.use('/cuenta-gastos', cuentaGastosRoutes);
app.use('/pedimentos', pedimentosRoutes);
app.use('/desglose-impuestos', desgloseImpuestosRoutes);


// Ruta básica de prueba
app.get('/', (req, res) => {
  res.send('¡Hola desde el backend de ALVASA-SYSTEM!');
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});