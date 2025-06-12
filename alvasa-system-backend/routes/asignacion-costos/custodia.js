const express = require('express');
const router = express.Router();
const controlador = require('../../controllers/asignacion-costos/custodiaController');

// POST para guardar o actualizar Custodia por asignación
router.post('/:id', controlador.guardarCustodia);

// GET para obtener Custodia por asignación
router.get('/:id', controlador.obtenerCustodia);

module.exports = router;