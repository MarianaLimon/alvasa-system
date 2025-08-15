const db = require('../../config/db');

// Registrar un nuevo abono
exports.registrarAbonoEstadoCuenta = async (req, res) => {
    console.log('📩 Body recibido en registrarAbonoEstadoCuenta:', req.body);
  const { id_estado_cuenta, abono, fecha_pago, tipo_transaccion } = req.body;

  // Validación de campos
  if (!id_estado_cuenta || !abono || !fecha_pago || !tipo_transaccion) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios.' });
  }

  const abonoNumero = Number(abono);
  if (isNaN(abonoNumero) || abonoNumero <= 0) {
    return res.status(400).json({ mensaje: 'El abono debe ser un número válido y mayor a cero.' });
  }

  try {
    // 1. Obtener total del estado de cuenta
    const [[estado]] = await db.promise().query(
      `SELECT total FROM estado_cuenta_clientes WHERE id_estado_cuenta = ?`,
      [id_estado_cuenta]
    );

    if (!estado) {
      return res.status(404).json({ mensaje: 'Estado de cuenta no encontrado.' });
    }

    const totalServicios = Number(estado.total) || 0;

    // 2. Obtener total ya abonado
    const [[abonosPrevios]] = await db.promise().query(
      `SELECT SUM(abono) AS total FROM abonos_estado_cuenta WHERE id_estado_cuenta = ?`,
      [id_estado_cuenta]
    );

    const totalAbonado = Number(abonosPrevios.total) || 0;
    const saldoActual = totalServicios - totalAbonado;

    // 3. Validar que no se exceda
    if (abonoNumero > saldoActual) {
      return res.status(400).json({ mensaje: `El abono excede el saldo actual. Saldo restante: $${saldoActual.toFixed(2)}` });
    }

    // 4. Insertar abono
    await db.promise().query(
      `INSERT INTO abonos_estado_cuenta (id_estado_cuenta, abono, fecha_pago, tipo_transaccion)
       VALUES (?, ?, ?, ?)`,
      [id_estado_cuenta, abonoNumero, fecha_pago, tipo_transaccion]
    );

    // 5. Recalcular abonos y saldo
    const nuevoTotalAbonado = totalAbonado + abonoNumero;
    const nuevoSaldo = totalServicios - nuevoTotalAbonado;
    const nuevoEstatus = nuevoSaldo <= 0 ? 'Pagado' : 'Pendiente';

    // 6. Actualizar estado de cuenta
    await db.promise().query(
      `UPDATE estado_cuenta_clientes
       SET abonado = ?, saldo = ?, estatus = ?
       WHERE id_estado_cuenta = ?`,
      [nuevoTotalAbonado, nuevoSaldo, nuevoEstatus, id_estado_cuenta]
    );

    res.status(200).json({ mensaje: 'Abono registrado correctamente.' });
  } catch (error) {
    console.error('❌ Error al registrar abono:', error);
    res.status(500).json({ mensaje: 'Error al registrar abono.' });
  }
};

// Obtener todos los abonos por estado de cuenta
exports.obtenerAbonosPorEstadoCuenta = async (req, res) => {
  const { id_estado_cuenta } = req.params;

  try {
    const [abonos] = await db.promise().query(
      `SELECT * FROM abonos_estado_cuenta WHERE id_estado_cuenta = ? ORDER BY fecha_pago ASC`,
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
  const { id } = req.params; // este es el id del abono (tabla abonos_estado_cuenta)

  try {
    // 1. Buscar el abono por ID
    const [[abono]] = await db.promise().query(
      `SELECT id_estado_cuenta, abono FROM abonos_estado_cuenta WHERE id = ?`,
      [id]
    );

    if (!abono) {
      return res.status(404).json({ mensaje: 'Abono no encontrado.' });
    }

    const { id_estado_cuenta } = abono;

    // 2. Eliminar el abono
    await db.promise().query(
      `DELETE FROM abonos_estado_cuenta WHERE id = ?`,
      [id]
    );

    // 3. Recalcular total abonado
    const [[abonosResult]] = await db.promise().query(
      `SELECT SUM(abono) AS total FROM abonos_estado_cuenta WHERE id_estado_cuenta = ?`,
      [id_estado_cuenta]
    );

    const nuevoTotalAbonado = Number(abonosResult.total) || 0;

    // 4. Obtener el total de la cuenta
    const [[estado]] = await db.promise().query(
      `SELECT total FROM estado_cuenta_clientes WHERE id_estado_cuenta = ?`,
      [id_estado_cuenta]
    );

    if (!estado) {
      return res.status(404).json({ mensaje: 'Estado de cuenta no encontrado.' });
    }

    const totalServicios = Number(estado.total);
    const nuevoSaldo = totalServicios - nuevoTotalAbonado;
    const nuevoEstatus = nuevoSaldo <= 0 ? 'Pagado' : 'Pendiente';

    // 5. Actualizar el estado de cuenta
    await db.promise().query(
      `UPDATE estado_cuenta_clientes
       SET abonado = ?, saldo = ?, estatus = ?
       WHERE id_estado_cuenta = ?`,
      [nuevoTotalAbonado, nuevoSaldo, nuevoEstatus, id_estado_cuenta]
    );

    res.status(200).json({ mensaje: 'Abono eliminado y estado de cuenta actualizado.' });

  } catch (error) {
    console.error('❌ Error al eliminar abono:', error);
    res.status(500).json({ mensaje: 'Error al eliminar abono.' });
  }
};

// ✅ Obtener un estado de cuenta específico (incluye servicios si quieres)
exports.obtenerEstadoCuentaPorId = async (req, res) => {
  const { id_estado_cuenta } = req.params;

  try {
    // 1. Obtener datos generales del estado de cuenta
    const [[estado]] = await db.promise().query(
      `SELECT *
       FROM estado_cuenta_clientes
       WHERE id_estado_cuenta = ?`,
      [id_estado_cuenta]
    );

    if (!estado) {
      return res.status(404).json({ mensaje: 'Estado de cuenta no encontrado.' });
    }

    // 2. Obtener los servicios relacionados
    const [servicios] = await db.promise().query(
      `SELECT giro, servicio, importe
       FROM servicios_estado_cuenta
       WHERE id_estado_cuenta = ?`,
      [id_estado_cuenta]
    );

    // 3. Devolver todo junto
    estado.servicios = servicios;

    res.status(200).json(estado);
  } catch (error) {
    console.error('❌ Error al obtener estado de cuenta por ID:', error);
    res.status(500).json({ mensaje: 'Error interno al obtener estado de cuenta.' });
  }
};
