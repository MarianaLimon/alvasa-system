const router = require('express').Router();
const {
  csvCobrosDataServicios,
  csvCobrosDataPagos,
  csvPagosProveedores,
  csvPagosRealizadosProveedores, 
  csvProcesosAsignacionDetalle,
} = require('../controllers/reportesController');

// Ping para comprobar que el router está montado
router.get('/ping', (_req, res) => res.send('reportes ok'));

// CSVs EC Clientes
router.get('/csv/cobros-data-servicios', csvCobrosDataServicios);
router.get('/csv/cobros-data-pagos', csvCobrosDataPagos);

// CSVs Proveedores
router.get('/csv/pagos-proveedores', csvPagosProveedores);
router.get('/csv/pagos-proveedores-realizados', csvPagosRealizadosProveedores); 

// CSV Alta de Embarques
router.get('/csv/procesos-asignacion-detalle', csvProcesosAsignacionDetalle);

module.exports = router;

