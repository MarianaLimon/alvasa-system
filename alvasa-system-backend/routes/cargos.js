const express = require('express');
const router = express.Router();
const { crearCargo, actualizarCargo } = require('../controllers/cargosCotizacionController');

// Ruta para crear cargos
router.post('/', crearCargo);

// Ruta para actualizar cargos
router.put('/:id', actualizarCargo);

module.exports = router;
