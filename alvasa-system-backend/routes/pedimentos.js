const express = require('express');
const router = express.Router();
const { crearPedimento } = require('../controllers/pedimentosCotizacionController');

// Ruta para crear pedimento
router.post('/', crearPedimento);

module.exports = router;