const db = require('../../config/db');

exports.insertarServiciosPorAsignacion = async (asignacionId, procesoId) => {
  try {
    console.log(`📦 Procesando servicios de Flete Terrestre para asignación ${asignacionId}`);

    const [estadoCuentaRows] = await db.promise().query(
      `SELECT id FROM estado_cuenta_clientes WHERE id_proceso_operativo = ? ORDER BY id DESC LIMIT 1`,
      [procesoId]
    );

    if (estadoCuentaRows.length === 0) {
      console.warn(`⚠️ No se encontró estado de cuenta para proceso ${procesoId}`);
      return;
    }

    const idEstadoCuenta = estadoCuentaRows[0].id;

    const [datosBase] = await db.promise().query(
      `SELECT 
        flete_venta, estadia_venta, burreo_venta, 
        sobrepeso_venta, apoyo_venta, pernocta_venta, id
       FROM flete_terrestre_costos
       WHERE asignacion_id = ?`,
      [asignacionId]
    );

    if (datosBase.length === 0) {
      console.warn(`⚠️ No se encontraron datos de flete terrestre para asignación ${asignacionId}`);
      return;
    }

    const flete = datosBase[0];

    const serviciosBase = [
      { servicio: 'FLETE TERRESTRE', importe: flete.flete_venta },
      { servicio: 'ESTADIA FLETE', importe: flete.estadia_venta },
      { servicio: 'BURREO', importe: flete.burreo_venta },
      { servicio: 'SOBREPESO', importe: flete.sobrepeso_venta },
      { servicio: 'APOYO EN CARGA', importe: flete.apoyo_venta },
      { servicio: 'PERNOCTA DE APOYO EN CARGA', importe: flete.pernocta_venta }
    ];

    const [extras] = await db.promise().query(
      `SELECT concepto, venta 
       FROM extras_flete_terrestre 
       WHERE flete_terrestre_id = ?`,
      [asignacionId]
    );

    const extrasFormateados = extras
      .filter(e => e.concepto && e.concepto.trim() !== '')
      .map(e => ({
        giro: 'Flete Terrestre',
        servicio: e.concepto.trim().toUpperCase(),
        importe: parseFloat(e.venta) || 0
      }));

    const todosLosServicios = [
      ...serviciosBase.map(s => ({
        giro: 'Flete Terrestre',
        servicio: s.servicio,
        importe: parseFloat(s.importe) || 0
      })),
      ...extrasFormateados
    ];

    console.log(`🔍 Servicios a insertar:`);
    todosLosServicios.forEach(s =>
      console.log(`➡️ ${s.servicio} - $${s.importe}`)
    );

    await db.promise().query(
      `DELETE FROM servicios_estado_cuenta WHERE id_estado_cuenta = ? AND giro = 'Flete Terrestre'`,
      [idEstadoCuenta]
    );

    for (const s of todosLosServicios) {
      await db.promise().query(
        `INSERT INTO servicios_estado_cuenta 
          (id_estado_cuenta, id_proceso_operativo, giro, servicio, importe)
         VALUES (?, ?, ?, ?, ?)`,
        [idEstadoCuenta, procesoId, s.giro, s.servicio, s.importe]
      );
      console.log(`✅ [${s.giro}] ${s.servicio} - $${s.importe.toFixed(2)}`);
    }

    console.log(`🟩 Servicios de Flete Terrestre insertados correctamente para asignación ${asignacionId}`);
  } catch (error) {
    console.error(`❌ Error al insertar servicios de Flete Terrestre:`, error);
  }
};
