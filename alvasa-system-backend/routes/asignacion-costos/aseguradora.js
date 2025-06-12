const express = require('express');
const router = express.Router();
const { guardarAseguradora, obtenerAseguradora } = require('../../controllers/asignacion-costos/aseguradoraController');

router.post('/:id', guardarAseguradora);
router.get('/:id', obtenerAseguradora);

module.exports = router;
