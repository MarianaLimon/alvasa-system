const express = require('express');
const router = express.Router();
const { 
  obtenerListaPagosProveedores,
  actualizarEstadoPago // esta es la nueva función que estamos usando
} = require('../../controllers/proveedores/listaProveedoresController');

// GET: lista de pagos (generada desde asignaciones y guardada en estado_pago_proveedor)
router.get('/', obtenerListaPagosProveedores);

// PUT: actualizar tipo de moneda, tipo de cambio, pesos y saldo
router.put('/estado/:numero_control', actualizarEstadoPago);

module.exports = router;
