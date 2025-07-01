const express = require('express');
const router = express.Router();
const despachoController = require('../../controllers/asignacion-costos/despachoController');

// Guardar
router.post('/:id', despachoController.guardarDespacho);

// Obtener
router.get('/:id', despachoController.obtenerDespacho);

module.exports = router;
