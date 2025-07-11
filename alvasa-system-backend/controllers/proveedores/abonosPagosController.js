const db = require('../../config/db');

// Obtener el total de abonos por número de control
const obtenerTotalAbonos = async (req, res) => {
  const { numero_control } = req.params;

  try {
    const [result] = await db.promise().query(
      'SELECT SUM(abono) AS total FROM abonos_pagos WHERE numero_control = ?',
      [numero_control]
    );

    const total = result[0].total || 0;
    res.json({ total });
  } catch (error) {
    console.error('Error al obtener total de abonos:', error);
    res.status(500).json({ error: 'Error al obtener total de abonos' });
  }
};

// Obtener la lista de abonos por número de control
const obtenerAbonosPorNumeroControl = async (req, res) => {
  const { numero_control } = req.params;

  try {
    const [abonos] = await db.promise().query(
      'SELECT * FROM abonos_pagos WHERE numero_control = ? ORDER BY fecha_pago ASC',
      [numero_control]
    );

    res.json(abonos);
  } catch (error) {
    console.error('❌ Error al obtener abonos:', error);
    res.status(500).json({ message: 'Error al obtener abonos' });
  }
};

// Registrar un nuevo abono
const registrarAbono = async (req, res) => {
  const { numero_control, abono, fecha_pago, tipo_transaccion } = req.body;

  try {
    if (!numero_control || !abono || !fecha_pago || !tipo_transaccion) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }

    await db.promise().query(`
      INSERT INTO abonos_pagos (numero_control, abono, fecha_pago, tipo_transaccion)
      VALUES (?, ?, ?, ?)
    `, [numero_control, abono, fecha_pago, tipo_transaccion]);

    const [totalRow] = await db.promise().query(`
      SELECT COALESCE(SUM(abono), 0) AS total FROM abonos_pagos WHERE numero_control = ?
    `, [numero_control]);
    const totalAbonado = parseFloat(totalRow[0].total);

    const [estadoRow] = await db.promise().query(`
      SELECT monto_en_pesos FROM estado_pago_proveedor WHERE numero_control = ?
    `, [numero_control]);
    const montoPesos = parseFloat(estadoRow[0]?.monto_en_pesos || 0);

    const saldo = Math.max(montoPesos - totalAbonado, 0);
    const estatus = saldo <= 0 ? 'Saldado' : 'Pendiente';

    await db.promise().query(`
      UPDATE estado_pago_proveedor
      SET saldo = ?, estatus = ?
      WHERE numero_control = ?
    `, [saldo, estatus, numero_control]);

    res.status(201).json({ message: 'Abono registrado y estado actualizado', saldo, estatus });

  } catch (error) {
    console.error('❌ Error al registrar abono:', error);
    res.status(500).json({ message: 'Error al registrar abono' });
  }
};

// Eliminar un abono existente
const eliminarAbono = async (req, res) => {
  const { id } = req.params;

  try {
    const [abonoRow] = await db.promise().query(`
      SELECT numero_control FROM abonos_pagos WHERE id = ?
    `, [id]);

    if (abonoRow.length === 0) {
      return res.status(404).json({ message: 'Abono no encontrado' });
    }

    const numero_control = abonoRow[0].numero_control;

    await db.promise().query(`DELETE FROM abonos_pagos WHERE id = ?`, [id]);

    const [totalRow] = await db.promise().query(`
      SELECT COALESCE(SUM(abono), 0) AS total FROM abonos_pagos WHERE numero_control = ?
    `, [numero_control]);
    const totalAbonado = parseFloat(totalRow[0].total);

    const [estadoRow] = await db.promise().query(`
      SELECT monto_en_pesos FROM estado_pago_proveedor WHERE numero_control = ?
    `, [numero_control]);
    const montoPesos = parseFloat(estadoRow[0]?.monto_en_pesos || 0);

    const saldo = Math.max(montoPesos - totalAbonado, 0);
    const estatus = saldo <= 0 ? 'Saldado' : 'Pendiente';

    await db.promise().query(`
      UPDATE estado_pago_proveedor SET saldo = ?, estatus = ? WHERE numero_control = ?
    `, [saldo, estatus, numero_control]);

    res.json({ message: 'Abono eliminado correctamente', saldo, estatus });

  } catch (error) {
    console.error('❌ Error al eliminar abono:', error);
    res.status(500).json({ message: 'Error al eliminar abono' });
  }
};

module.exports = {
  obtenerTotalAbonos,
  obtenerAbonosPorNumeroControl,
  registrarAbono,
  eliminarAbono
};
