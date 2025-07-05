const express = require('express');
const router = express.Router();
const { 
  obtenerListaPagosProveedores,
  registrarAbono,
  obtenerAbonosPorNumeroControl,
  obtenerTotalAbonos // ← esta línea es nueva
} = require('../../controllers/proveedores/pagosController');

// GET: lista de pagos
router.get('/', obtenerListaPagosProveedores);

// POST: registrar abono
router.post('/abonos', registrarAbono);

// GET: obtener abonos por número de control
router.get('/abonos/:numero_control', obtenerAbonosPorNumeroControl);

// Actualizar Saldo en la lista de proveedores 
router.get('/abonos/total/:numero_control', obtenerTotalAbonos);


module.exports = router;
