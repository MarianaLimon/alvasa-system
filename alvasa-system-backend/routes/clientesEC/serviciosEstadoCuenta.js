const express = require('express');
const router = express.Router();
const { controladorDummy } = require('../../controllers/clientesEC/serviciosEstadoCuentaController');

// Ruta dummy para que no truene
router.get('/', controladorDummy);

module.exports = router;
