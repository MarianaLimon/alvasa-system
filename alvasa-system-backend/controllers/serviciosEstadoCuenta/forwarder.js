const db = require('../../config/db');

exports.insertarServiciosPorAsignacion = async (asignacionId, procesoId) => {
  try {
    const [[estado]] = await db.promise().query(`
      SELECT id FROM estado_cuenta_clientes WHERE asignacion_id = ?
    `, [asignacionId]);
    if (!estado) return;

    const idEstadoCuenta = estado.id;

    await db.promise().query(`
      DELETE FROM servicios_estado_cuenta WHERE id_estado_cuenta = ? AND giro = 'Forwarder'
    `, [idEstadoCuenta]);

    const [[datos]] = await db.promise().query(`
      SELECT 
        flete_internacional_venta, cargos_locales_venta, demoras_venta,
        tipo_servicio_extra, venta_servicio_extra
      FROM forwarder_costos WHERE asignacion_id = ?
    `, [asignacionId]);

    const servicios = [
      { servicio: 'Flete Internacional', importe: datos.flete_internacional_venta },
      { servicio: 'Cargos Locales', importe: datos.cargos_locales_venta },
      { servicio: 'Demoras', importe: datos.demoras_venta },
      { servicio: datos.tipo_servicio_extra, importe: datos.venta_servicio_extra },
    ];

    for (const s of servicios) {
      if (!s.servicio || !s.importe || s.importe === 0) continue;
      await db.promise().query(`
        INSERT INTO servicios_estado_cuenta 
        (id_estado_cuenta, id_proceso_operativo, giro, servicio, importe)
        VALUES (?, ?, 'Forwarder', ?, ?)
      `, [idEstadoCuenta, procesoId, s.servicio, s.importe]);
    }

    console.log('✅ Servicios Forwarder insertados');
  } catch (error) {
    console.error('❌ Error en Forwarder:', error);
  }
};
