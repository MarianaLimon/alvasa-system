const db = require('../../config/db');

exports.insertarServiciosPorAsignacion = async (asignacionId, procesoId) => {
  try {
    // Obtener estado de cuenta
    const [[estado]] = await db.promise().query(
      'SELECT id FROM estado_cuenta_clientes WHERE asignacion_id = ?',
      [asignacionId]
    );
    if (!estado) return;

    const idEstadoCuenta = estado.id;

    // Limpiar giro
    await db.promise().query(
      `DELETE FROM servicios_estado_cuenta WHERE id_estado_cuenta = ? AND giro = 'Paquetería'`,
      [idEstadoCuenta]
    );

    // Traer datos reales
    const [[row]] = await db.promise().query(`
      SELECT empresa, venta
      FROM paqueteria_costos
      WHERE asignacion_id = ?
    `, [asignacionId]);

    if (!row || !row.venta || Number(row.venta) <= 0) return;

    const servicio = (row.empresa || 'Paquetería').trim();

    await db.promise().query(`
      INSERT INTO servicios_estado_cuenta (id_estado_cuenta, id_proceso_operativo, giro, servicio, importe)
      VALUES (?, ?, 'Paquetería', ?, ?)
    `, [idEstadoCuenta, procesoId, servicio, row.venta]);
  } catch (err) {
    console.error('❌ [Paquetería] Error al insertar servicio:', err);
  }
};
