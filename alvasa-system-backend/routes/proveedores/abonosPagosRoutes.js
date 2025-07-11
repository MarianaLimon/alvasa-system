const express = require('express');
const router = express.Router();
const {
  obtenerTotalAbonos,
  obtenerAbonosPorNumeroControl,
  registrarAbono,
  eliminarAbono
} = require('../../controllers/proveedores/abonosPagosController');

router.get('/abonos/total/:numero_control', obtenerTotalAbonos);
router.get('/abonos/:numero_control', obtenerAbonosPorNumeroControl); // ✅ esta ruta es la que te faltaba
router.post('/abonos', registrarAbono);
router.delete('/abonos/:id', eliminarAbono);

module.exports = router;
