const express = require('express');
const router = express.Router();
const {
  crearDesgloseImpuestos,
  actualizarDesgloseImpuestos
} = require('../controllers/desgloseImpuestosCotizacionController');

// Ruta para crear desglose de impuestos
router.post('/', crearDesgloseImpuestos);

// Ruta para actualizar desglose de impuestos por ID de cotización
router.put('/:id', actualizarDesgloseImpuestos);

module.exports = router;