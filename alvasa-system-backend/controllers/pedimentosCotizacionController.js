const db = require('../config/db');

// Función para crear pedimento
const crearPedimento = (req, res) => {
  const {
    cotizacion_id,
    tipoCambio,
    pesoBruto,
    valorAduana,
    dta,
    ivaPrv,
    igiIge,
    prv,
    iva,
    total
  } = req.body;

  const sql = `
    INSERT INTO pedimentos_cotizacion
    (cotizacion_id, tipo_cambio, peso_bruto, valor_aduana, dta, iva_prv, igi_ige, prv, iva, total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    cotizacion_id,
    tipoCambio,
    pesoBruto,
    valorAduana,
    dta,
    ivaPrv,
    igiIge,
    prv,
    iva,
    total
  ], (err, result) => {
    if (err) {
      console.error('Error al insertar pedimento:', err);
      return res.status(500).json({ error: 'Error al guardar pedimento' });
    }
    res.status(201).json({ message: 'Pedimento guardado correctamente', id: result.insertId });
  });
};

// Función para actualizar pedimento
const actualizarPedimento = (req, res) => {
  const { id } = req.params;
  const {
    tipoCambio,
    pesoBruto,
    valorAduana,
    dta,
    ivaPrv,
    igiIge,
    prv,
    iva,
    total
  } = req.body;

  const sql = `
    UPDATE pedimentos_cotizacion SET
      tipo_cambio = ?, peso_bruto = ?, valor_aduana = ?, dta = ?,
      iva_prv = ?, igi_ige = ?, prv = ?, iva = ?, total = ?
    WHERE cotizacion_id = ?
  `;

  db.query(sql, [
    tipoCambio,
    pesoBruto,
    valorAduana,
    dta,
    ivaPrv,
    igiIge,
    prv,
    iva,
    total,
    id
  ], (err) => {
    if (err) {
      console.error('Error al actualizar pedimento:', err);
      return res.status(500).json({ error: 'Error al actualizar pedimento' });
    }
    res.json({ message: 'Pedimento actualizado correctamente' });
  });
};

module.exports = { crearPedimento, actualizarPedimento };