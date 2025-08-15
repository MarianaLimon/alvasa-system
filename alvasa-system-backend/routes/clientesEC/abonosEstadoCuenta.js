const express = require('express');
const router = express.Router();

const {
  registrarAbonoEstadoCuenta,
  obtenerAbonosPorEstadoCuenta,
  obtenerTotalAbonosEstadoCuenta,
  eliminarAbonoEstadoCuenta,
  obtenerEstadoCuentaPorId,
} = require('../../controllers/clientesEC/abonosEstadoCuentaController');

// --- Middlewares simples de validación ---
const ensureIdEC = (req, _res, next) => {
  // Acepta formatos tipo "EC-0006"
  const { id_estado_cuenta } = req.params;
  if (!id_estado_cuenta || typeof id_estado_cuenta !== 'string') {
    return next(new Error('Parámetro id_estado_cuenta inválido.'));
  }
  next();
};

const ensureIdAbono = (req, _res, next) => {
  const { id } = req.params;
  if (!/^\d+$/.test(String(id))) {
    return next(new Error('Parámetro id de abono inválido.'));
  }
  next();
};

// POST: registrar nuevo abono
router.post('/', registrarAbonoEstadoCuenta);

// GET: obtener un estado de cuenta (detalle + servicios)
router.get('/detalle/:id_estado_cuenta', ensureIdEC, obtenerEstadoCuentaPorId);

// GET: obtener total de abonos
router.get('/total/:id_estado_cuenta', ensureIdEC, obtenerTotalAbonosEstadoCuenta);

// GET: obtener todos los abonos por estado de cuenta
router.get('/:id_estado_cuenta', ensureIdEC, obtenerAbonosPorEstadoCuenta);

// DELETE: eliminar abono por ID
router.delete('/:id', ensureIdAbono, eliminarAbonoEstadoCuenta);

module.exports = router;
