const express = require('express');
const router = express.Router();
const cargosCotizacionController = require('../controllers/cargosCotizacionController');


router.post('/', cargosCotizacionController.crearCargo);

module.exports = router;