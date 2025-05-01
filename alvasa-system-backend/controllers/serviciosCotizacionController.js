const db = require('../config/db');

// Función para crear servicios
const crearServicio = (req, res) => {
  const {
    cotizacion_id,
    maniobras,
    revalidacion,
    gestionDestino,
    inspeccionPeritaje,
    documentacionImportacion,
    garantiaContenedores,
    distribucion,
    serentyPremium,
    total
  } = req.body;

  const sql = `
    INSERT INTO servicios_cotizacion 
    (cotizacion_id, maniobras, revalidacion, gestion_destino, inspeccion_peritaje, documentacion_importacion, garantia_contenedores, distribucion, serenty_premium, total_servicios)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    cotizacion_id,
    maniobras,
    revalidacion,
    gestionDestino,
    inspeccionPeritaje,
    documentacionImportacion,
    garantiaContenedores,
    distribucion,
    serentyPremium,
    total
  ], (err, result) => {
    if (err) {
      console.error('Error al insertar servicios:', err);
      return res.status(500).json({ error: 'Error al guardar servicios' });
    }
    res.status(201).json({ message: 'Servicios guardados correctamente', id: result.insertId });
  });
};

// Función para actualizar servicios
const actualizarServicio = (req, res) => {
  const {
    cotizacion_id,
    maniobras,
    revalidacion,
    gestionDestino,
    inspeccionPeritaje,
    documentacionImportacion,
    garantiaContenedores,
    distribucion,
    serentyPremium,
    total
  } = req.body;

  const sql = `
    UPDATE servicios_cotizacion SET
      maniobras = ?,
      revalidacion = ?,
      gestion_destino = ?,
      inspeccion_peritaje = ?,
      documentacion_importacion = ?,
      garantia_contenedores = ?,
      distribucion = ?,
      serenty_premium = ?,
      total_servicios = ?
    WHERE cotizacion_id = ?
  `;

  db.query(sql, [
    maniobras,
    revalidacion,
    gestionDestino,
    inspeccionPeritaje,
    documentacionImportacion,
    garantiaContenedores,
    distribucion,
    serentyPremium,
    total,
    cotizacion_id
  ], (err, result) => {
    if (err) {
      console.error('Error al actualizar servicios:', err);
      return res.status(500).json({ error: 'Error al actualizar servicios' });
    }
    res.status(200).json({ message: 'Servicios actualizados correctamente' });
  });
};

module.exports = { crearServicio, actualizarServicio };