const { insertarServiciosPorAsignacion: insertarServiciosAADespacho } = require('../controllers/serviciosEstadoCuenta/aaDespacho');
const { insertarServiciosPorAsignacion: insertarServiciosForwarder } = require('../controllers/serviciosEstadoCuenta/forwarder');
const { insertarServiciosPorAsignacion: insertarServiciosFleteTerrestre } = require('../controllers/serviciosEstadoCuenta/fleteTerrestre');
const { insertarServiciosPorAsignacion: insertarServiciosCustodia } = require('../controllers/serviciosEstadoCuenta/custodia');
const { insertarServiciosPorAsignacion: insertarServiciosPaqueteria } = require('../controllers/serviciosEstadoCuenta/paqueteria');
const { insertarServiciosPorAsignacion: insertarServiciosAseguradora } = require('../controllers/serviciosEstadoCuenta/aseguradora');

async function sincronizarServiciosEstadoCuenta(asignacionId, procesoId) {
  try {
    console.log(`🔄 Sincronizando servicios para asignación ${asignacionId} y proceso ${procesoId}...`);

    await insertarServiciosAADespacho(asignacionId, procesoId);
    await insertarServiciosForwarder(asignacionId, procesoId);
    await insertarServiciosFleteTerrestre(asignacionId, procesoId);
    await insertarServiciosCustodia(asignacionId, procesoId);
    await insertarServiciosPaqueteria(asignacionId, procesoId);
    await insertarServiciosAseguradora(asignacionId, procesoId);

    console.log('✅ Todos los servicios fueron sincronizados correctamente en el estado de cuenta');
  } catch (error) {
    console.error('❌ Error durante la sincronización global de servicios:', error);
  }
}

module.exports = { sincronizarServiciosEstadoCuenta };
