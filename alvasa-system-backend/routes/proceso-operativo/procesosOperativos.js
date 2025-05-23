const express = require('express');
const router = express.Router();
const controller = require('../../controllers/proceso-operativo/procesosOperativosController');
const db = require('../../config/db');

// Crear proceso operativo
router.post('/', controller.crearProcesoOperativo);

// Obtener el siguiente folio disponible
router.get('/siguiente-folio', (req, res) => {
  db.query('SELECT MAX(id) AS ultimo_id FROM procesos_operativos', (err, resultado) => {
    if (err) {
      console.error('Error al generar el folio del proceso:', err);
      return res.status(500).json({ error: 'Error al generar folio' });
    }

    const siguienteId = (resultado[0].ultimo_id || 0) + 1;
    const folio = `PROC-${String(siguienteId).padStart(4, '0')}`;
    res.json({ folio });
  });
});

// Permitir la edición (PUT)
router.put('/:id', controller.actualizarProcesoOperativo);

// Eliminar proceso operativo
router.delete('/:id', controller.eliminarProcesoOperativo);

// Generar PDF 
router.get('/pdf/:id', controller.generarPDFProcesoOperativo);

// Obtener proceso operativo por ID (¡debe ir al final!)
router.get('/:id', controller.obtenerProcesoOperativoPorId);

// Obtener todos los procesos operativos
router.get('/', controller.obtenerProcesosOperativos);



module.exports = router;