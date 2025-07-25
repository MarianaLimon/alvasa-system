const express = require('express');
const router = express.Router();
const {
  obtenerEstadosCuentaClientes
} = require('../../controllers/clientesEC/estadoCuentaClientesController');

// ✅ Solo GET, sin generación manual
router.get('/', obtenerEstadosCuentaClientes);

module.exports = router;
