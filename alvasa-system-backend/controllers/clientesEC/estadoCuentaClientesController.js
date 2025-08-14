const db = require('../../config/db');
const { sincronizarServiciosEstadoCuenta } = require('../../utils/sincronizarServiciosEstadoCuenta');

// 🔢 Generador de ID tipo EC-0001
async function generarIdEstadoCuenta() {
  const [rows] = await db.promise().query(`
    SELECT id_estado_cuenta FROM estado_cuenta_clientes ORDER BY id DESC LIMIT 1
  `);
  if (rows.length === 0) return 'EC-0001';
  const numero = parseInt(rows[0].id_estado_cuenta.split('-')[1]) + 1;
  return `EC-${numero.toString().padStart(4, '0')}`;
}

// ✅ Inserta o actualiza automáticamente la fila del estado de cuenta
exports.insertarOCrearEstadoCuenta = async (idAsignacion, idProceso) => {
  try {
    console.log(`🧩 Procesando asignación ${idAsignacion} / proceso ${idProceso}`);

    // 1. Datos base
    const [[datos]] = await db.promise().query(`
      SELECT 
        po.id AS id_proceso_operativo,
        po.folio_proceso,
        po.cliente_id,
        c.nombre AS cliente,
        ac.id AS asignacion_id,
        ac.no_contenedor AS contenedor,
        ac.tipo_carga,
        ac.mercancia,
        src.entrega AS fecha_entrega
      FROM procesos_operativos po
      JOIN clientes c ON po.cliente_id = c.id
      JOIN asignacion_costos ac ON ac.proceso_operativo_id = po.id
      JOIN salida_retorno_contenedor src ON po.id = src.proceso_operativo_id
      WHERE po.id = ? AND ac.id = ?
    `, [idProceso, idAsignacion]);

    if (!datos) return console.log(`⚠️ Datos no encontrados para asignación ${idAsignacion}`);

    // 2. Calcular total
    const [[{ total }]] = await db.promise().query(`
      SELECT SUM(venta) AS total FROM (
        SELECT flete_internacional_venta AS venta FROM forwarder_costos WHERE asignacion_id = ?
        UNION ALL SELECT cargos_locales_venta FROM forwarder_costos WHERE asignacion_id = ?
        UNION ALL SELECT demoras_venta FROM forwarder_costos WHERE asignacion_id = ?
        UNION ALL SELECT venta_servicio_extra FROM forwarder_costos WHERE asignacion_id = ?
        UNION ALL SELECT flete_venta FROM flete_terrestre_costos WHERE asignacion_id = ?
        UNION ALL SELECT estadia_venta FROM flete_terrestre_costos WHERE asignacion_id = ?
        UNION ALL SELECT burreo_venta FROM flete_terrestre_costos WHERE asignacion_id = ?
        UNION ALL SELECT sobrepeso_venta FROM flete_terrestre_costos WHERE asignacion_id = ?
        UNION ALL SELECT apoyo_venta FROM flete_terrestre_costos WHERE asignacion_id = ?
        UNION ALL SELECT pernocta_venta FROM flete_terrestre_costos WHERE asignacion_id = ?
        UNION ALL SELECT custodia_venta FROM custodia_costos WHERE asignacion_id = ?
        UNION ALL SELECT custodia_pernocta_venta FROM custodia_costos WHERE asignacion_id = ?
        UNION ALL SELECT custodia_falso_venta FROM custodia_costos WHERE asignacion_id = ?
        UNION ALL SELECT custodia_cancelacion_venta FROM custodia_costos WHERE asignacion_id = ?
        UNION ALL SELECT custodia_dias_venta FROM custodia_costos WHERE asignacion_id = ?
        UNION ALL SELECT custodia_venta_almacenaje FROM custodia_costos WHERE asignacion_id = ?
        UNION ALL SELECT venta FROM paqueteria_costos WHERE asignacion_id = ?
        UNION ALL SELECT venta FROM aseguradora_costos WHERE asignacion_id = ?
        UNION ALL SELECT importacion_venta FROM aa_despacho_costos WHERE asignacion_id = ?
        UNION ALL SELECT almacenajes_venta FROM aa_despacho_costos WHERE asignacion_id = ?
        UNION ALL SELECT servicio_venta FROM aa_despacho_costos WHERE asignacion_id = ?
        UNION ALL SELECT venta_servicio1 FROM aa_despacho_costos WHERE asignacion_id = ?
        UNION ALL SELECT venta_servicio2 FROM aa_despacho_costos WHERE asignacion_id = ?
      ) AS subformularios
    `, Array(23).fill(idAsignacion));

    const abonado = 0;
    const saldo = total || 0;
    const estatus = saldo === 0 ? 'Pagado' : 'Pendiente';

    // 3. Verificar existencia
    const [[existe]] = await db.promise().query(
      'SELECT id FROM estado_cuenta_clientes WHERE asignacion_id = ?',
      [idAsignacion]
    );

    let idEstadoCuenta;

    if (existe) {
      idEstadoCuenta = existe.id;
      await db.promise().query(`
        UPDATE estado_cuenta_clientes SET
          total = ?, abonado = ?, saldo = ?, estatus = ?, actualizado_en = NOW()
        WHERE asignacion_id = ?
      `, [saldo, abonado, saldo, estatus, idAsignacion]);
      console.log(`🔁 Actualizado estado de cuenta para asignación ${idAsignacion}`);

      // 🧽 Borrar servicios previos para ese estado
      await db.promise().query(`DELETE FROM servicios_estado_cuenta WHERE id_estado_cuenta = ?`, [idEstadoCuenta]);
    } else {
      const nuevoId = await generarIdEstadoCuenta();
      idEstadoCuenta = nuevoId;

      await db.promise().query(`
        INSERT INTO estado_cuenta_clientes (
          id_estado_cuenta, id_proceso_operativo, cliente_id, asignacion_id,
          folio_proceso, cliente, contenedor, fecha_entrega, tipo_carga, mercancia,
          total, abonado, saldo, estatus, creado_en, actualizado_en
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        nuevoId,
        datos.id_proceso_operativo,
        datos.cliente_id,
        datos.asignacion_id,
        datos.folio_proceso,
        datos.cliente,
        datos.contenedor,
        datos.fecha_entrega || null,
        datos.tipo_carga,
        datos.mercancia,
        saldo,
        abonado,
        saldo,
        estatus
      ]);
      console.log(`🆕 Insertado nuevo estado de cuenta: ${nuevoId}`);
    }

    // 4. Reinsertar todos los servicios actualizados
    await sincronizarServiciosEstadoCuenta(idAsignacion, idProceso);
    console.log(`✅ Servicios insertados para asignación ${idAsignacion}`);
  } catch (error) {
    console.error('❌ Error en estado de cuenta:', error);
  }
};

// 🔍 Obtener todos los estados de cuenta
exports.obtenerEstadosCuentaClientes = async (req, res) => {
  try {
    const [estados] = await db.promise().query(`
      SELECT * FROM estado_cuenta_clientes ORDER BY creado_en DESC
    `);

    for (const estado of estados) {
      const [servicios] = await db.promise().query(
        `SELECT giro, servicio, importe
         FROM servicios_estado_cuenta
         WHERE id_estado_cuenta = ?`,
        [estado.id]
      );
      estado.servicios = servicios;
    }

    res.json(estados);
  } catch (error) {
    console.error('❌ Error al obtener estados de cuenta:', error);
    res.status(500).json({ error: 'Error al obtener estados de cuenta' });
  }
};


// 🔄 Ejecutar automáticamente al iniciar
async function generarTodosLosEstadosDeCuenta() {
  try {
    const [asignaciones] = await db.promise().query(`
      SELECT ac.id AS asignacion_id, po.id AS id_proceso
      FROM asignacion_costos ac
      JOIN procesos_operativos po ON po.id = ac.proceso_operativo_id
    `);

    for (const fila of asignaciones) {
      await exports.insertarOCrearEstadoCuenta(fila.asignacion_id, fila.id_proceso);
    }

    console.log('✅ Estados de cuenta generados automáticamente');
  } catch (error) {
    console.error('❌ Error al generar todos los estados de cuenta:', error);
  }
}

// ▶️ Lanzar al iniciar si está vacío
(async () => {
  const [rows] = await db.promise().query(`SELECT COUNT(*) AS total FROM estado_cuenta_clientes`);
  if (rows[0].total === 0) {
    console.log('ℹ️ Generando estados de cuenta iniciales...');
    await generarTodosLosEstadosDeCuenta();
  }
})();
