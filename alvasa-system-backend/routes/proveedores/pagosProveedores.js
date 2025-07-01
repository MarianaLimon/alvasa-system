const express = require('express');
const router = express.Router();
const { obtenerListaPagosProveedores } = require('../../controllers/proveedores/pagosController');

router.get('/', obtenerListaPagosProveedores);

module.exports = router;
