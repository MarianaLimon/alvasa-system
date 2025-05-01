const express = require('express');
const router = express.Router();
const { crearServicio, actualizarServicio } = require('../controllers/serviciosCotizacionController');

// Ruta para crear servicios
router.post('/', crearServicio);

// Ruta para actualizar servicios por cotización
router.put('/:cotizacion_id', actualizarServicio);

module.exports = router;