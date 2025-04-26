const express = require('express');
const router = express.Router();
const { crearCuentaGastos } = require('../controllers/cuentaGastosCotizacionController');

// Ruta para crear cuenta de gastos
router.post('/', crearCuentaGastos);

module.exports = router;