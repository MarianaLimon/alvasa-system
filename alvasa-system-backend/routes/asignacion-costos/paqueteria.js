const express = require('express');
const router = express.Router();
const paqueteriaController = require('../../controllers/asignacion-costos/paqueteriaController');

router.post('/:id', paqueteriaController.guardarPaqueteria);
router.get('/:id', paqueteriaController.obtenerPaqueteria);

module.exports = router;