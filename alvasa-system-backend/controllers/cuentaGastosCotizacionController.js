const db = require('../config/db');

// Función para crear cuenta de gastos
const crearCuentaGastos = (req, res) => {
  const {
    cotizacion_id,
    honorarios,
    padron,
    serviciosComplementarios,
    manejoCarga,
    subtotal,
    iva,
    total
  } = req.body;

  const sql = `
    INSERT INTO cuenta_gastos_cotizacion 
    (cotizacion_id, honorarios, padron, servicios_complementarios, manejo_carga, subtotal, iva, total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    cotizacion_id,
    honorarios,
    padron,
    serviciosComplementarios,
    manejoCarga,
    subtotal,
    iva,
    total
  ], (err, result) => {
    if (err) {
      console.error('Error al insertar cuenta de gastos:', err);
      return res.status(500).json({ error: 'Error al guardar cuenta de gastos' });
    }
    res.status(201).json({ message: 'Cuenta de gastos guardada correctamente', id: result.insertId });
  });
};

// Función para actualizar cuenta de gastos
const actualizarCuentaGastos = (req, res) => {
  const { id } = req.params;
  const {
    honorarios,
    padron,
    serviciosComplementarios,
    manejoCarga,
    subtotal,
    iva,
    total
  } = req.body;

  const sql = `
    UPDATE cuenta_gastos_cotizacion SET
      honorarios = ?, padron = ?, servicios_complementarios = ?,
      manejo_carga = ?, subtotal = ?, iva = ?, total = ?
    WHERE cotizacion_id = ?
  `;

  db.query(sql, [
    honorarios,
    padron,
    serviciosComplementarios,
    manejoCarga,
    subtotal,
    iva,
    total,
    id
  ], (err) => {
    if (err) {
      console.error('Error al actualizar cuenta de gastos:', err);
      return res.status(500).json({ error: 'Error al actualizar cuenta de gastos' });
    }
    res.status(200).json({ message: 'Cuenta de gastos actualizada correctamente' });
  });
};

module.exports = { crearCuentaGastos, actualizarCuentaGastos };