const express = require('express');
const router = express.Router();
const cotizacionesController = require('../controllers/cotizacionesController');

// Cotizaciones principales
router.get('/', cotizacionesController.obtenerTodas);
router.get('/:id', cotizacionesController.obtenerPorId);
router.get('/folio/:folio', cotizacionesController.obtenerPorFolio);
router.post('/', cotizacionesController.crearCotizacion);
router.put('/:id', cotizacionesController.actualizarCotizacion);
router.delete('/:id', cotizacionesController.eliminarCotizacion);

// Subformularios
router.put('/cargos/:id', cotizacionesController.actualizarCargos);
router.put('/servicios/:id', cotizacionesController.actualizarServicios);
router.put('/cuenta-gastos/:id', cotizacionesController.actualizarCuentaGastos);
router.put('/pedimentos/:id', cotizacionesController.actualizarPedimentos);
router.put('/desglose-impuestos/:id', cotizacionesController.actualizarDesgloseImpuestos);

module.exports = router;