const db = require('../../config/db');

exports.insertarServiciosPorAsignacion = async (asignacionId, procesoId) => {
  try {
    const [[estado]] = await db.promise().query(`
      SELECT id FROM estado_cuenta_clientes WHERE asignacion_id = ?
    `, [asignacionId]);
    if (!estado) return;

    const idEstadoCuenta = estado.id;

    await db.promise().query(`
      DELETE FROM servicios_estado_cuenta WHERE id_estado_cuenta = ? AND giro = 'AA Despacho'
    `, [idEstadoCuenta]);

    const [[datos]] = await db.promise().query(`
      SELECT 
        importacion_venta, almacenajes_venta, servicio_venta,
        tipo_servicio1, venta_servicio1, tipo_servicio2, venta_servicio2
      FROM aa_despacho_costos WHERE asignacion_id = ?
    `, [asignacionId]);

    const servicios = [
      { servicio: 'Importación', importe: datos.importacion_venta },
      { servicio: 'Almacenajes', importe: datos.almacenajes_venta },
      { servicio: 'Serv. Prg. Mo Ejec.', importe: datos.servicio_venta },
      { servicio: datos.tipo_servicio1, importe: datos.venta_servicio1 },
      { servicio: datos.tipo_servicio2, importe: datos.venta_servicio2 },
    ];

    for (const s of servicios) {
      if (!s.servicio || !s.importe || s.importe === 0) continue;
      await db.promise().query(`
        INSERT INTO servicios_estado_cuenta 
        (id_estado_cuenta, id_proceso_operativo, giro, servicio, importe)
        VALUES (?, ?, 'AA Despacho', ?, ?)
      `, [idEstadoCuenta, procesoId, s.servicio, s.importe]);
    }

    console.log('✅ Servicios AA Despacho insertados');
  } catch (error) {
    console.error('❌ Error en AA Despacho:', error);
  }
};
