const express = require('express');
const router = express.Router();
const {
  crearCuentaGastos,
  actualizarCuentaGastos
} = require('../controllers/cuentaGastosCotizacionController');

// Ruta para crear cuenta de gastos
router.post('/', crearCuentaGastos);

// Ruta para actualizar cuenta de gastos
router.put('/:id', actualizarCuentaGastos);

module.exports = router;