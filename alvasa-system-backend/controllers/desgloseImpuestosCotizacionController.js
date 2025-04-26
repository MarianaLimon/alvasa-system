const db = require('../config/db');

// Función para crear un desglose de impuestos
const crearDesgloseImpuestos = (req, res) => {
  const {
    cotizacion_id,
    valorFactura,
    flete,
    tipoCambio,
    dta,
    igi,
    iva,
    prv,
    ivaPrv,
    total
  } = req.body;

  const sql = `
    INSERT INTO desglose_impuestos_cotizacion
    (cotizacion_id, valor_factura, flete, tipo_cambio, dta, igi, iva, prv, iva_prv, total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    cotizacion_id,
    valorFactura,
    flete,
    tipoCambio,
    dta,
    igi,
    iva,
    prv,
    ivaPrv,
    total
  ], (err, result) => {
    if (err) {
      console.error('Error al insertar desglose de impuestos:', err);
      return res.status(500).json({ error: 'Error al guardar desglose de impuestos' });
    }
    res.status(201).json({ message: 'Desglose de impuestos guardado correctamente', id: result.insertId });
  });
};

module.exports = { crearDesgloseImpuestos };