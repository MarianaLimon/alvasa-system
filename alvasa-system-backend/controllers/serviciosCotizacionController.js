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

module.exports = { crearServicio };