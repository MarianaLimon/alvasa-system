const express = require('express');
const path = require('path');
const db = require('./config/db');

// Rutas
const pdfRoutes = require('./routes/pdf');
const clientesRoutes = require('./routes/clientes');
const cotizacionesRoutes = require('./routes/cotizaciones');
const cargosRoutes = require('./routes/cargos');
const serviciosRoutes = require('./routes/servicios');
const cuentaGastosRoutes = require('./routes/cuentaGastos');
const pedimentosRoutes = require('./routes/pedimentos');
const desgloseImpuestosRoutes = require('./routes/desgloseImpuestos');

const procesosOperativosRoutes = require('./routes/proceso-operativo/procesosOperativos');
const asignacionCostosRoutes = require('./routes/asignacion-costos/asignacionCostos');

const app = express();
const port = 5050;

//
// ✅ CORS manual que funciona siempre
//
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // Preflight
  }
  next();
});

// ✅ Middleware JSON
app.use(express.json());

// ✅ Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Rutas del sistema
app.use('/clientes', clientesRoutes);
app.use('/cotizaciones', cotizacionesRoutes);
app.use('/cargos', cargosRoutes);
app.use('/servicios', serviciosRoutes);
app.use('/cuenta-gastos', cuentaGastosRoutes);
app.use('/pedimentos', pedimentosRoutes);
app.use('/desglose-impuestos', desgloseImpuestosRoutes);
app.use('/api', pdfRoutes);
app.use('/procesos-operativos', procesosOperativosRoutes);
app.use('/asignacion-costos', asignacionCostosRoutes);

// ✅ Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Hola desde el backend de ALVASA-SYSTEM!');
});

// ✅ Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});