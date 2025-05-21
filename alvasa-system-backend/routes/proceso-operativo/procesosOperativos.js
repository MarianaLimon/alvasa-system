const express = require('express');
const router = express.Router();
const controller = require('../../controllers/proceso-operativo/procesosOperativosController');

// Crear proceso operativo
router.post('/', controller.crearProcesoOperativo);

// Obtener todos los procesos operativos
router.get('/', controller.obtenerProcesosOperativos);

// Obtener proceso operativo por ID
router.get('/:id', controller.obtenerProcesoOperativoPorId);

module.exports = router;