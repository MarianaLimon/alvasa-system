const db = require('../../config/db');

exports.guardarDespacho = (req, res) => {
  const asignacionId = req.params.id;
  const {
    facturacion,
    comisionSocio,
    propuestaCosto,
    cotizacionFolio,
    propuestaCotizacion,
    comisionIntermediario
  } = req.body;

  const sql = `
    INSERT INTO despacho_costos 
    (asignacion_id, facturacion, comision_socio, propuesta_costo, cotizacion_folio, propuesta, comision_intermediario)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      facturacion = VALUES(facturacion),
      comision_socio = VALUES(comision_socio),
      propuesta_costo = VALUES(propuesta_costo),
      cotizacion_folio = VALUES(cotizacion_folio),
      propuesta = VALUES(propuesta),
      comision_intermediario = VALUES(comision_intermediario)
  `;

  db.query(sql, [
    asignacionId,
    facturacion,
    comisionSocio,
    propuestaCosto,
    cotizacionFolio,
    propuestaCotizacion,
    comisionIntermediario
  ], (err, result) => {
    if (err) {
      console.error('❌ Error al guardar despacho:', err);
      return res.status(500).json({ error: 'Error al guardar despacho' });
    }
    res.status(200).json({ message: 'Despacho guardado correctamente' });
  });
};

exports.obtenerDespacho = (req, res) => {
  const asignacionId = req.params.id;

  const sql = `
    SELECT * FROM despacho_costos
    WHERE asignacion_id = ?
    LIMIT 1
  `;

  db.query(sql, [asignacionId], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener despacho:', err);
      return res.status(500).json({ error: 'Error al obtener datos de despacho' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No se encontró despacho para esta asignación' });
    }

    res.json(results[0]);
  });
};
