const express = require('express');
const router = express.Router();
const cotizacionesController = require('../controllers/cotizacionesController');

router.get('/', cotizacionesController.getCotizaciones);
router.post('/', cotizacionesController.createCotizacion);
router.put('/:id', cotizacionesController.updateCotizacion);
router.delete('/:id', cotizacionesController.deleteCotizacion);

module.exports = router;