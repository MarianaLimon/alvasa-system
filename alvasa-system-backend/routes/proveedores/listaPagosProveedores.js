const express = require('express');
const router = express.Router();
const { 
  obtenerListaPagosProveedores,
  actualizarEstadoPago,
  obtenerTotalesGenerales 
} = require('../../controllers/proveedores/listaProveedoresController');

// GET: lista de pagos (generada desde asignaciones y guardada en estado_pago_proveedor)
router.get('/', obtenerListaPagosProveedores);

// PUT: actualizar tipo de moneda, tipo de cambio, pesos y saldo
router.put('/estado/:numero_control', actualizarEstadoPago);

// GET: totales generales por grupo
router.get('/totales', obtenerTotalesGenerales); 
module.exports = router;
