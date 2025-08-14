const db = require('../../config/db');

exports.insertarServiciosPorAsignacion = async (asignacionId, procesoId) => {
  try {
    // Buscar el estado de cuenta correspondiente
    const [[estado]] = await db.promise().query(
      'SELECT id FROM estado_cuenta_clientes WHERE asignacion_id = ?',
      [asignacionId]
    );

    if (!estado) {
      console.log(`⚠️ No se encontró estado de cuenta para asignación ${asignacionId}`);
      return;
    }

    const idEstadoCuenta = estado.id;

    // Borrar servicios previos de este giro
    await db.promise().query(
      `DELETE FROM servicios_estado_cuenta WHERE id_estado_cuenta = ? AND giro = 'Custodia'`,
      [idEstadoCuenta]
    );

    // Obtener datos de la tabla custodia_costos
    const [[datos]] = await db.promise().query(`
      SELECT 
        custodia_venta,
        custodia_pernocta_venta,
        custodia_falso_venta,
        custodia_cancelacion_venta
      FROM custodia_costos
      WHERE asignacion_id = ?
    `, [asignacionId]);

    if (!datos) {
      console.log(`ℹ️ No hay datos de custodia para asignación ${asignacionId}`);
      return;
    }

    const servicios = [
      { servicio: 'Custodia', importe: datos.custodia_venta },
      { servicio: 'Pernocta de Custodia', importe: datos.custodia_pernocta_venta },
      { servicio: 'Custodia en Falso', importe: datos.custodia_falso_venta },
      { servicio: 'Cancelación de Custodia', importe: datos.custodia_cancelacion_venta }
    ];

    for (const { servicio, importe } of servicios) {
      const valor = parseFloat(importe);
      if (!isNaN(valor) && valor > 0) {
        await db.promise().query(`
          INSERT INTO servicios_estado_cuenta (id_estado_cuenta, id_proceso_operativo, giro, servicio, importe)
          VALUES (?, ?, 'Custodia', ?, ?)
        `, [idEstadoCuenta, procesoId, servicio, valor]);
        console.log(`✅ [Custodia] ${servicio} - $${valor.toFixed(2)}`);
      }
    }

    console.log(`🟢 Servicios de CUSTODIA insertados para asignación ${asignacionId}`);
  } catch (error) {
    console.error('❌ Error al insertar servicios de custodia:', error);
  }
};
