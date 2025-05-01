const express = require('express');
const router = express.Router();
const { crearPedimento, actualizarPedimento } = require('../controllers/pedimentosCotizacionController');

// Ruta para crear un pedimento
router.post('/', crearPedimento);

// Ruta para actualizar un pedimento
router.put('/:id', actualizarPedimento);

module.exports = router;