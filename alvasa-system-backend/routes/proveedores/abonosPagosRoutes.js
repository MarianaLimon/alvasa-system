const express = require('express');
const router = express.Router();
const {
  obtenerTotalAbonos,
  obtenerAbonosPorNumeroControl,
  registrarAbono,
  eliminarAbono,
  generarPDFAbonos
} = require('../../controllers/proveedores/abonosPagosController');

router.get('/abonos/total/:numero_control', obtenerTotalAbonos);
router.get('/abonos/:numero_control', obtenerAbonosPorNumeroControl);
router.post('/abonos', registrarAbono);
router.delete('/abonos/:id', eliminarAbono);
router.post('/abonos/pdf', generarPDFAbonos);

module.exports = router;
