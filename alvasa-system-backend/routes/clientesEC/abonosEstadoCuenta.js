const express = require('express');
const router = express.Router();

const {
  registrarAbonoEstadoCuenta,
  obtenerAbonosPorEstadoCuenta,
  obtenerTotalAbonosEstadoCuenta,
  eliminarAbonoEstadoCuenta,
  obtenerEstadoCuentaPorId
} = require('../../controllers/clientesEC/abonosEstadoCuentaController');

// POST: registrar nuevo abono
router.post('/', registrarAbonoEstadoCuenta);

// GET: obtener un estado de cuenta (para actualización en frontend)
router.get('/detalle/:id_estado_cuenta', obtenerEstadoCuentaPorId); 

// GET: obtener total de abonos
router.get('/total/:id_estado_cuenta', obtenerTotalAbonosEstadoCuenta);

// GET: obtener todos los abonos por estado de cuenta
router.get('/:id_estado_cuenta', obtenerAbonosPorEstadoCuenta);

// DELETE: eliminar abono por ID
router.delete('/:id', eliminarAbonoEstadoCuenta);

module.exports = router;
