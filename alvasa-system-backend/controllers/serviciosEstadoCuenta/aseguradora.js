const db = require('../../config/db');

exports.insertarServiciosPorAsignacion = async (asignacionId, procesoId) => {
  try {
    console.log(`🔎 Procesando Aseguradora para asignación ${asignacionId}`);

    // 1) Traer datos de la tabla aseguradora_costos
    const [rows] = await db.promise().query(
      `SELECT aseguradora, venta
         FROM aseguradora_costos
        WHERE asignacion_id = ?`,
      [asignacionId]
    );

    if (!rows || rows.length === 0) {
      console.log('⚠️ No hay registros de Aseguradora para esta asignación');
      return;
    }

    // 2) Limpiar los servicios previos de este giro
    await db.promise().query(
      `DELETE FROM servicios_estado_cuenta
        WHERE giro = 'Aseguradora'
          AND id_estado_cuenta = (
            SELECT id FROM estado_cuenta_clientes
             WHERE asignacion_id = ?
             LIMIT 1
          )`,
      [asignacionId]
    );

    // 3) Insertar servicios (incluyendo id_proceso_operativo)
    for (const r of rows) {
      const servicio = r.aseguradora || 'Aseguradora';
      const importe  = r.venta ?? 0;

      await db.promise().query(
        `INSERT INTO servicios_estado_cuenta
           (id_estado_cuenta, id_proceso_operativo, giro, servicio, importe)
         VALUES (
           (SELECT id FROM estado_cuenta_clientes WHERE asignacion_id = ? LIMIT 1),
           ?, 'Aseguradora', ?, ?
         )`,
        [asignacionId, procesoId, servicio, importe]
      );

      console.log(`✅ [Aseguradora] ${servicio} - $${Number(importe).toFixed(2)}`);
    }

    console.log(`🟢 Servicios de Aseguradora insertados para asignación ${asignacionId}`);
  } catch (error) {
    console.error('❌ Error al insertar servicios de Aseguradora:', error);
    throw error;
  }
};
