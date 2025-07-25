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
const aaDespachoRoutes = require('./routes/asignacion-costos/aaDespacho');
const forwarderRoutes = require('./routes/asignacion-costos/forwarder');
const fleteTerrestreRoutes = require('./routes/asignacion-costos/fleteTerrestre');
const custodiaRoutes = require('./routes/asignacion-costos/custodia');
const paqueteriaRoutes = require('./routes/asignacion-costos/paqueteria');
const aseguradoraRoutes = require('./routes/asignacion-costos/aseguradora');
const despachoRoutes = require('./routes/asignacion-costos/despacho');
const listaPagosProveedoresRoutes = require('./routes/proveedores/listaPagosProveedores');
const abonosPagosRoutes = require('./routes/proveedores/abonosPagosRoutes');
const listaEstadoCuentaCliente = require('./routes/clientesEC/estadoCuentaClientes');
const servEstadoCuentaCliente = require('./routes/clientesEC/serviciosEstadoCuenta');


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
app.use('/asignacion-costos/aa-despacho', aaDespachoRoutes);
app.use('/asignacion-costos/forwarder', forwarderRoutes);
app.use('/asignacion-costos/flete-terrestre', fleteTerrestreRoutes);
app.use('/asignacion-costos/custodia', custodiaRoutes);
app.use('/asignacion-costos/paqueteria', paqueteriaRoutes);
app.use('/asignacion-costos/aseguradora', aseguradoraRoutes);
app.use('/asignacion-costos/despacho', despachoRoutes);
app.use('/pagos-proveedores', listaPagosProveedoresRoutes);
app.use('/pagos-proveedores', abonosPagosRoutes);
app.use('/estado-cuenta-clientes',listaEstadoCuentaCliente);
app.use('/api/servicios-estado-cuenta',servEstadoCuentaCliente);

// ✅ Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Hola desde el backend de ALVASA-SYSTEM!');
});

// ✅ Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});