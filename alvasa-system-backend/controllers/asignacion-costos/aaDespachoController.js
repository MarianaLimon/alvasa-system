const db = require('../../config/db');

// Guardar o actualizar datos de AA Despacho
const guardarAADespacho = (req, res) => {
  const asignacionId = parseInt(req.params.asignacionId, 10);
  if (isNaN(asignacionId)) {
    return res.status(400).json({ error: 'ID de asignación inválido' });
  }

  const {
    aaDespacho = '',
    importacionCosto = 0,
    importacionVenta = 0,
    almacenajesCosto = 0,
    almacenajesVenta = 0,
    servicioCosto = 0,
    servicioVenta = 0,
    tipoServicio1 = '',
    costoServicio1 = 0,
    ventaServicio1 = 0,
    tipoServicio2 = '',
    costoServicio2 = 0,
    ventaServicio2 = 0
  } = req.body;

  const sql = `
    INSERT INTO aa_despacho_costos (
      asignacion_id, aa_despacho,
      importacion_costo, importacion_venta,
      almacenajes_costo, almacenajes_venta,
      servicio_costo, servicio_venta,
      tipo_servicio1, costo_servicio1, venta_servicio1,
      tipo_servicio2, costo_servicio2, venta_servicio2
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      aa_despacho = VALUES(aa_despacho),
      importacion_costo = VALUES(importacion_costo),
      importacion_venta = VALUES(importacion_venta),
      almacenajes_costo = VALUES(almacenajes_costo),
      almacenajes_venta = VALUES(almacenajes_venta),
      servicio_costo = VALUES(servicio_costo),
      servicio_venta = VALUES(servicio_venta),
      tipo_servicio1 = VALUES(tipo_servicio1),
      costo_servicio1 = VALUES(costo_servicio1),
      venta_servicio1 = VALUES(venta_servicio1),
      tipo_servicio2 = VALUES(tipo_servicio2),
      costo_servicio2 = VALUES(costo_servicio2),
      venta_servicio2 = VALUES(venta_servicio2)
  `;

  const valores = [
    asignacionId, aaDespacho,
    importacionCosto, importacionVenta,
    almacenajesCosto, almacenajesVenta,
    servicioCosto, servicioVenta,
    tipoServicio1, costoServicio1, ventaServicio1,
    tipoServicio2, costoServicio2, ventaServicio2
  ];

  db.query(sql, valores, (err, result) => {
    if (err) {
      console.error('❌ Error al guardar AA Despacho:', err);
      return res.status(500).json({ error: 'Error al guardar los datos de AA Despacho' });
    }
    res.status(200).json({ message: 'Datos de AA Despacho guardados correctamente' });
  });
};

// Obtener datos de AA Despacho por asignación
const obtenerAADespacho = (req, res) => {
  const asignacionId = parseInt(req.params.asignacionId, 10);
  if (isNaN(asignacionId)) {
    return res.status(400).json({ error: 'ID de asignación inválido' });
  }

  const sql = `SELECT * FROM aa_despacho_costos WHERE asignacion_id = ?`;

  db.query(sql, [asignacionId], (err, result) => {
    if (err) {
      console.error('❌ Error al obtener AA Despacho:', err);
      return res.status(500).json({ error: 'Error al obtener los datos' });
    }
    if (result.length === 0) {
      console.warn(`⚠️ No se encontró AA Despacho para asignación ${asignacionId}`);
    }
    res.status(200).json(result[0] || {});
  });
};

module.exports = { guardarAADespacho, obtenerAADespacho };