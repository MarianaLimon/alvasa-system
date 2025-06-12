const express = require('express');
const router = express.Router();
const controller = require('../../controllers/proceso-operativo/procesosOperativosController');
const db = require('../../config/db');

// Crear proceso operativo
router.post('/', controller.crearProcesoOperativo);

// Obtener el siguiente folio disponible
router.get('/siguiente-folio', (req, res) => {
  db.query(
    `SELECT folio_proceso 
    FROM procesos_operativos 
    ORDER BY CAST(SUBSTRING(folio_proceso, 6) AS UNSIGNED) DESC 
    LIMIT 1`,
    (err, resultado) => {
      if (err) {
        console.error('Error al generar el folio del proceso:', err);
        return res.status(500).json({ error: 'Error al generar folio' });
      }

      let nuevoFolio = 'PROC-0001';

      if (resultado.length > 0 && resultado[0].folio_proceso) {
        const ultimoFolio = resultado[0].folio_proceso; // Ej: "PROC-0011"
        const numero = parseInt(ultimoFolio.split('-')[1]) + 1;
        nuevoFolio = `PROC-${String(numero).padStart(4, '0')}`;
      }

      res.json({ folio: nuevoFolio });
    }
  );
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