const express = require('express');
const router = express.Router();
const asignacionCostosController = require('../../controllers/asignacion-costos/asignacionCostosController');
const { obtenerAsignacionCompleta } = asignacionCostosController;
const { generarPdfAsignacion } = require('../../controllers/asignacion-costos/pdfAsignacionController');

// Crear nueva asignación
router.post('/', asignacionCostosController.crearAsignacionCostos);

// Obtener todas las asignaciones
router.get('/', asignacionCostosController.obtenerAsignaciones);

// Rutas específicas 
router.get('/completo/:folio', obtenerAsignacionCompleta);
router.get('/folio/:folio', asignacionCostosController.obtenerPorFolio);
router.get('/proceso/:procesoId', asignacionCostosController.obtenerPorProcesoOperativo);

// Rutas generales 
router.get('/:id', asignacionCostosController.obtenerAsignacionPorId);
router.put('/:id', asignacionCostosController.actualizarAsignacion);
router.delete('/:id', asignacionCostosController.eliminarAsignacion);

// Generar PDF
router.get('/pdf/:id', generarPdfAsignacion);

module.exports = router;