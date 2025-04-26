const express = require('express');
const router = express.Router();
const { crearDesgloseImpuestos } = require('../controllers/desgloseImpuestosCotizacionController');

// Ruta para crear un desglose de impuestos
router.post('/', crearDesgloseImpuestos);

module.exports = router;