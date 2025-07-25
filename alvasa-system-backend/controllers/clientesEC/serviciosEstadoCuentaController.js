const db = require('../../config/db');

exports.insertarServiciosPorAsignacion = async (asignacion_id) => {
  try {
    console.log(`🚀 Insertando servicios AA DESPACHO para asignación ${asignacion_id}`);

    // 1. Buscar estado de cuenta vinculado
    const [[estado]] = await db.promise().query(
      'SELECT id, id_proceso_operativo FROM estado_cuenta_clientes WHERE asignacion_id = ?',
      [asignacion_id]
    );
    if (!estado) {
      console.log('⚠️ No se encontró estado de cuenta para asignación:', asignacion_id);
      return;
    }

    const idEstadoCuenta = estado.id;
    const idProcesoOperativo = estado.id_proceso_operativo;

    // 2. Limpiar servicios previos para este giro
    await db.promise().query(
      `DELETE FROM servicios_estado_cuenta WHERE id_estado_cuenta = ? AND giro = 'AA Despacho'`,
      [idEstadoCuenta]
    );

    // 3. Obtener datos reales de la tabla aa_despacho_costos
    const [[datos]] = await db.promise().query(`
      SELECT 
        importacion_venta,
        almacenajes_venta,
        servicio_venta,
        tipo_servicio1, venta_servicio1,
        tipo_servicio2, venta_servicio2
      FROM aa_despacho_costos
      WHERE asignacion_id = ?
    `, [asignacion_id]);

    if (!datos) {
      console.log('ℹ️ No hay datos de AA Despacho para esta asignación.');
      return;
    }

    const servicios = [
      { servicio: 'Importación', importe: datos.importacion_venta },
      { servicio: 'Almacenajes', importe: datos.almacenajes_venta },
      { servicio: 'Serv. Prg. Mo Ejec.', importe: datos.servicio_venta },
      { servicio: datos.tipo_servicio1, importe: datos.venta_servicio1 },
      { servicio: datos.tipo_servicio2, importe: datos.venta_servicio2 },
    ];

    for (const s of servicios) {
      if (!s.servicio || !s.importe || Number(s.importe) === 0) continue;

      console.log(`✅ Insertando: ${s.servicio} - $${s.importe}`);

      await db.promise().query(`
        INSERT INTO servicios_estado_cuenta (id_estado_cuenta, id_proceso_operativo, giro, servicio, importe)
        VALUES (?, ?, 'AA Despacho', ?, ?)
      `, [idEstadoCuenta, idProcesoOperativo, s.servicio, s.importe]);
    }

    console.log('🎉 Servicios de AA Despacho insertados correctamente');
  } catch (error) {
    console.error('❌ Error al insertar servicios de AA Despacho:', error);
  }
};
