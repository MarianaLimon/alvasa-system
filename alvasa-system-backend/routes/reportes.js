const router = require('express').Router();
const {
  csvCobrosDataServicios,
  csvCobrosDataPagos,
  csvPagosProveedores,  
} = require('../controllers/reportesController');

// Ping para comprobar que el router está montado
router.get('/ping', (_req, res) => res.send('reportes ok'));

// CSVs ya hechos
router.get('/csv/cobros-data-servicios', csvCobrosDataServicios);
router.get('/csv/cobros-data-pagos', csvCobrosDataPagos);

// NUEVO: Proveedores
router.get('/csv/pagos-proveedores', csvPagosProveedores);

module.exports = router;
