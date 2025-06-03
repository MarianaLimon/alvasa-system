const express = require('express');
const router = express.Router();
const asignacionCostosController = require('../../controllers/asignacion-costos/asignacionCostosController');

// Crear nueva asignación
router.post('/', asignacionCostosController.crearAsignacionCostos);

// Obtener todas las asignaciones
router.get('/', asignacionCostosController.obtenerAsignaciones);

// Obtener una asignación por ID
router.get('/:id', asignacionCostosController.obtenerAsignacionPorId);

// Obtener una asignación por ID_proceso
router.get('/proceso/:procesoId', asignacionCostosController.obtenerPorProcesoOperativo);

// Obtener una asignación por FOLIO_proceso
router.get('/folio/:folio', asignacionCostosController.obtenerPorFolio);

// Actualizar una asignación por ID
router.put('/:id', asignacionCostosController.actualizarAsignacion);

// Eliminar una asignación (opcional)
router.delete('/:id', asignacionCostosController.eliminarAsignacion);


module.exports = router;