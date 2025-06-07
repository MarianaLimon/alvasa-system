const express = require('express');
const router = express.Router();
const controlador = require('../../controllers/asignacion-costos/fleteTerrestreController');

// POST para guardar o actualizar Flete Terrestre por asignación
router.post('/:id', controlador.guardarFleteTerrestre);

// GET para obtener Flete Terrestre por asignación
router.get('/:id', controlador.obtenerFleteTerrestre);

module.exports = router;