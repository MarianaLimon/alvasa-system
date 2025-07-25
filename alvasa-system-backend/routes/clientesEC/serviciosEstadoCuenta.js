const express = require('express');
const router = express.Router();
const { insertarServiciosPorAsignacion } = require('../../controllers/clientesEC/serviciosEstadoCuentaController');

// Ruta para probar manualmente desde Postman si hace falta
router.post('/:asignacion_id', async (req, res) => {
  try {
    const { asignacion_id } = req.params;
    await insertarServiciosPorAsignacion(asignacion_id);
    res.json({ message: 'Servicios insertados correctamente.' });
  } catch (error) {
    console.error('Error en la ruta servicios estado cuenta:', error);
    res.status(500).json({ error: 'Error al insertar servicios.' });
  }
});

module.exports = router;
