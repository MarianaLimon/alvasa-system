const db = require('../../config/db');

// Registrar un nuevo abono
exports.registrarAbonoEstadoCuenta = async (req, res) => {
  const { id_estado_cuenta, abono, fecha_pago, tipo_transaccion } = req.body;

  if (!id_estado_cuenta || abono === undefined || abono === null) {
    return res.status(400).json({ mensaje: 'id_estado_cuenta y abono son obligatorios.' });
  }

  // Normaliza/Redondea a 2 decimales en backend
  const montoRaw = Number(abono);
  const monto = Math.round((isNaN(montoRaw) ? 0 : montoRaw) * 100) / 100;

  if (monto <= 0) {
    return res.status(400).json({ mensaje: 'El abono debe ser un número mayor a 0.' });
  }

  const conn = db.promise();
  try {
    await conn.beginTransaction();

    // Lock del estado
    const [rows] = await conn.query(
      `SELECT id, total, abonado, saldo, estatus
         FROM estado_cuenta_clientes
        WHERE id_estado_cuenta = ?
        FOR UPDATE`,
      [id_estado_cuenta]
    );
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ mensaje: 'Estado de cuenta no encontrado.' });
    }
    const estado = rows[0];

    // Suma actual de abonos (dentro de la transacción) para validar contra saldo
    const [[{ totalAbonos: sumaActual }]] = await conn.query(
      `SELECT COALESCE(SUM(abono),0) AS totalAbonos
         FROM abonos_estado_cuenta
        WHERE id_estado_cuenta = ?`,
      [id_estado_cuenta]
    );

    const saldoDisponible = Math.max(Number(estado.total) - Number(sumaActual), 0);
    if (monto > saldoDisponible) {
      await conn.rollback();
      return res.status(400).json({
        mensaje: `El abono (${monto.toFixed(2)}) excede el saldo disponible (${saldoDisponible.toFixed(2)}).`,
      });
    }

    // Inserta abono
    await conn.query(
      `INSERT INTO abonos_estado_cuenta (id_estado_cuenta, abono, fecha_pago, tipo_transaccion)
       VALUES (?, ?, ?, ?)`,
      [id_estado_cuenta, monto, fecha_pago || null, tipo_transaccion || null]
    );

    // Recalcula totales post-insert
    const [[{ totalAbonos }]] = await conn.query(
      `SELECT COALESCE(SUM(abono),0) AS totalAbonos
         FROM abonos_estado_cuenta
        WHERE id_estado_cuenta = ?`,
      [id_estado_cuenta]
    );

    const nuevoAbonado = Number(totalAbonos);
    const saldoRaw = Number(estado.total) - nuevoAbonado;
    const nuevoSaldo = saldoRaw < 0 ? 0 : saldoRaw;
    const nuevoEstatus = nuevoSaldo <= 0 ? 'Pagado' : 'Pendiente';

    await conn.query(
      `UPDATE estado_cuenta_clientes
          SET abonado = ?, saldo = ?, estatus = ?, actualizado_en = NOW()
        WHERE id_estado_cuenta = ?`,
      [nuevoAbonado, nuevoSaldo, nuevoEstatus, id_estado_cuenta]
    );

    await conn.commit();
    return res.status(201).json({
      mensaje: 'Abono registrado correctamente.',
      totales: { abonado: nuevoAbonado, saldo: nuevoSaldo, estatus: nuevoEstatus }
    });
  } catch (error) {
    try { await conn.rollback(); } catch {}
    console.error('❌ Error en registrarAbonoEstadoCuenta:', error);
    return res.status(500).json({ mensaje: 'Error al registrar abono.' });
  }
};

// Obtener todos los abonos por estado de cuenta
exports.obtenerAbonosPorEstadoCuenta = async (req, res) => {
  const { id_estado_cuenta } = req.params;
  try {
    const [abonos] = await db.promise().query(
      `SELECT * 
         FROM abonos_estado_cuenta 
        WHERE id_estado_cuenta = ? 
        ORDER BY (fecha_pago IS NULL), fecha_pago ASC, id ASC`,
      [id_estado_cuenta]
    );
    res.json(abonos);
  } catch (error) {
    console.error('❌ Error al obtener abonos:', error);
    res.status(500).json({ mensaje: 'Error al obtener abonos.' });
  }
};

// Obtener total de abonos por estado de cuenta
exports.obtenerTotalAbonosEstadoCuenta = async (req, res) => {
  const { id_estado_cuenta } = req.params;

  try {
    const [result] = await db.promise().query(
      `SELECT SUM(abono) AS total FROM abonos_estado_cuenta WHERE id_estado_cuenta = ?`,
      [id_estado_cuenta]
    );
    const total = result[0].total || 0;
    res.json({ total });
  } catch (error) {
    console.error('❌ Error al obtener total de abonos:', error);
    res.status(500).json({ mensaje: 'Error al obtener total de abonos.' });
  }
};

exports.eliminarAbonoEstadoCuenta = async (req, res) => {
  const { id } = req.params;

  const conn = db.promise();
  try {
    await conn.beginTransaction();

    const [[abono]] = await conn.query(
      `SELECT id, id_estado_cuenta, abono
         FROM abonos_estado_cuenta
        WHERE id = ?`,
      [id]
    );
    if (!abono) {
      await conn.rollback();
      return res.status(404).json({ mensaje: 'Abono no encontrado.' });
    }

    const idEstadoCuenta = abono.id_estado_cuenta;

    const [rowsEstado] = await conn.query(
      `SELECT id, total
         FROM estado_cuenta_clientes
        WHERE id_estado_cuenta = ?
        FOR UPDATE`,
      [idEstadoCuenta]
    );
    if (rowsEstado.length === 0) {
      await conn.rollback();
      return res.status(404).json({ mensaje: 'Estado de cuenta no encontrado.' });
    }

    await conn.query(`DELETE FROM abonos_estado_cuenta WHERE id = ?`, [id]);

    const [[{ totalAbonos }]] = await conn.query(
      `SELECT COALESCE(SUM(abono),0) AS totalAbonos
         FROM abonos_estado_cuenta
        WHERE id_estado_cuenta = ?`,
      [idEstadoCuenta]
    );

    const nuevoAbonado = Number(totalAbonos);
    const saldoRaw = Number(rowsEstado[0].total) - nuevoAbonado;
    const nuevoSaldo = saldoRaw < 0 ? 0 : saldoRaw;
    const nuevoEstatus = nuevoSaldo <= 0 ? 'Pagado' : 'Pendiente';

    await conn.query(
      `UPDATE estado_cuenta_clientes
          SET abonado = ?, saldo = ?, estatus = ?, actualizado_en = NOW()
        WHERE id_estado_cuenta = ?`,
      [nuevoAbonado, nuevoSaldo, nuevoEstatus, idEstadoCuenta]
    );

    await conn.commit();
    return res.json({
      mensaje: 'Abono eliminado y totales actualizados.',
      totales: { abonado: nuevoAbonado, saldo: nuevoSaldo, estatus: nuevoEstatus }
    });
  } catch (error) {
    try { await conn.rollback(); } catch {}
    console.error('❌ Error en eliminarAbonoEstadoCuenta:', error);
    return res.status(500).json({ mensaje: 'Error al eliminar abono.' });
  }
};

// ✅ Obtener un estado de cuenta específico (con servicios y totales calculados)
exports.obtenerEstadoCuentaPorId = async (req, res) => {
  const { id_estado_cuenta } = req.params; // p.ej. "EC-0006"

  try {
    // 1) Trae la fila por el CÓDIGO legible
    const [[estado]] = await db.promise().query(
      `SELECT * 
         FROM estado_cuenta_clientes 
        WHERE id_estado_cuenta = ?`,
      [id_estado_cuenta]
    );
    if (!estado) {
      return res.status(404).json({ mensaje: 'Estado de cuenta no encontrado.' });
    }

    // 2) Con el id interno, jala los servicios
    const [servicios] = await db.promise().query(
      `SELECT giro, servicio, importe
         FROM servicios_estado_cuenta
        WHERE id_estado_cuenta = ?`,
      [estado.id] // id numérico interno
    );

    // 3) Suma de abonos por código (varchar)
    const [[{ sumaAbonos }]] = await db.promise().query(
      `SELECT COALESCE(SUM(abono),0) AS sumaAbonos
         FROM abonos_estado_cuenta
        WHERE id_estado_cuenta = ?`,
      [id_estado_cuenta]
    );

    // 4) Totales calculados
    const totalServicios = Number(estado.total || 0);
    const totalAbonos = Number(sumaAbonos || 0);
    const saldoCalc = Math.max(totalServicios - totalAbonos, 0);
    const estatusCalc = saldoCalc <= 0 ? 'Pagado' : 'Pendiente';

    // 5) Empaqueta todo y responde una sola vez
    return res.status(200).json({
      ...estado,
      servicios,
      total_abonos: totalAbonos,
      saldo_calc: saldoCalc,
      estatus_calc: estatusCalc,
    });

  } catch (error) {
    console.error('❌ Error al obtener estado de cuenta por ID:', error);
    return res.status(500).json({ mensaje: 'Error interno al obtener estado de cuenta.' });
  }
};
