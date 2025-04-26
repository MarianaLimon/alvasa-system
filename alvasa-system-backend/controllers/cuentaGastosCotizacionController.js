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

module.exports = { crearCuentaGastos };