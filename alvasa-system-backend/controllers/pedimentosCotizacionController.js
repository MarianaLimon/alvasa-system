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

module.exports = { crearPedimento };