const router = require('express').Router();
const {
  csvCobrosDataServicios,
  csvCobrosDataPagos,
  csvOperacionesCargosExtra
} = require('../controllers/reportesController');

// Sin filtros (como pediste)
router.get('/csv/cobros-data-servicios', csvCobrosDataServicios);
router.get('/csv/cobros-data-pagos', csvCobrosDataPagos);
router.get('/csv/operaciones-cargos-extra', csvOperacionesCargosExtra);

module.exports = router;
