const express = require('express');
const router = express.Router();
const { crearServicio } = require('../controllers/serviciosCotizacionController');

// Ruta para crear servicios
router.post('/', crearServicio);

module.exports = router;