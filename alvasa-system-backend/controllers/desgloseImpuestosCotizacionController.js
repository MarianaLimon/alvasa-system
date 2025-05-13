const db = require('../config/db');

// Función para crear un desglose de impuestos
const crearDesgloseImpuestos = (req, res) => {
  const {
    cotizacion_id,
    valorFactura,
    flete,
    tipoCambio,
    valorAduana,
    dta,
    igi,
    iva,
    prv,
    ivaPrv,
    total
  } = req.body;

  const sql = `
    INSERT INTO desglose_impuestos_cotizacion
    (cotizacion_id, valor_factura, flete, tipo_cambio, valor_aduana, dta, igi, iva, prv, iva_prv, total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    cotizacion_id,
    valorFactura,
    flete,
    tipoCambio,
    valorAduana,
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

// Función para actualizar desglose de impuestos
const actualizarDesgloseImpuestos = (req, res) => {
  const { id } = req.params;
  const {
    valorFactura,
    flete,
    tipoCambio,
    valorAduana,
    dta,
    igi,
    iva,
    prv,
    ivaPrv,
    total
  } = req.body;

  const sql = `
    UPDATE desglose_impuestos_cotizacion SET
      valor_factura = ?, flete = ?, tipo_cambio = ?, valor_aduana = ?, dta = ?,
      igi = ?, iva = ?, prv = ?, iva_prv = ?, total = ?
    WHERE cotizacion_id = ?
  `;

  db.query(sql, [
    valorFactura,
    flete,
    tipoCambio,
    valorAduana,
    dta,
    igi,
    iva,
    prv,
    ivaPrv,
    total,
    id
  ], (err) => {
    if (err) {
      console.error('Error al actualizar desglose de impuestos:', err);
      return res.status(500).json({ error: 'Error al actualizar desglose de impuestos' });
    }
    res.json({ message: 'Desglose de impuestos actualizado correctamente' });
  });
};

module.exports = {
  crearDesgloseImpuestos,
  actualizarDesgloseImpuestos
};