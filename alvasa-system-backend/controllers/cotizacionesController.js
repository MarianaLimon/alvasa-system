const db = require('../config/db');

exports.getCotizaciones = (req, res) => {
  db.query('SELECT * FROM cotizaciones', (err, results) => {
    if (err) {
      console.error('Error al obtener cotizaciones:', err);
      return res.status(500).json({ error: 'Error al obtener cotizaciones' });
    }
    res.json(results);
  });
};

exports.createCotizacion = (req, res) => {
  const { cliente_id, folio, fecha, estatus, total, propuesta, ahorro, despacho, observaciones } = req.body;
  const query = 'INSERT INTO cotizaciones (cliente_id, folio, fecha, estatus, total, propuesta, ahorro, despacho, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [cliente_id, folio, fecha, estatus, total, propuesta, ahorro, despacho, observaciones], (err, results) => {
    if (err) {
      console.error('Error al insertar cotización:', err);
      return res.status(500).json({ error: 'Error al insertar cotización' });
    }
    res.status(201).json({ message: 'Cotización insertada correctamente', id: results.insertId });
  });
};

exports.updateCotizacion = (req, res) => {
  const { id } = req.params;
  const { cliente_id, folio, fecha, estatus, total, propuesta, ahorro, despacho, observaciones } = req.body;
  const query = 'UPDATE cotizaciones SET cliente_id = ?, folio = ?, fecha = ?, estatus = ?, total = ?, propuesta = ?, ahorro = ?, despacho = ?, observaciones = ? WHERE id = ?';
  db.query(query, [cliente_id, folio, fecha, estatus, total, propuesta, ahorro, despacho, observaciones, id], (err, results) => {
    if (err) {
      console.error('Error al actualizar cotización:', err);
      return res.status(500).json({ error: 'Error al actualizar cotización' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Cotización no encontrada' });
    }
    res.status(200).json({ message: 'Cotización actualizada correctamente' });
  });
};

exports.deleteCotizacion = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM cotizaciones WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al eliminar cotización:', err);
      return res.status(500).json({ error: 'Error al eliminar cotización' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Cotización no encontrada' });
    }
    res.status(200).json({ message: 'Cotización eliminada correctamente' });
  });
};