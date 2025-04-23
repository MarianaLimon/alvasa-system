const db = require('../config/db');

exports.getCostosAdicionales = (req, res) => {
  db.query('SELECT * FROM costos_adicionales', (err, results) => {
    if (err) {
      console.error('Error al obtener costos adicionales:', err);
      return res.status(500).json({ error: 'Error al obtener los costos adicionales' });
    }
    res.json(results);
  });
};

exports.createCostoAdicional = (req, res) => {
  const { cotizacion_id, descripcion, monto } = req.body;
  const query = 'INSERT INTO costos_adicionales (cotizacion_id, descripcion, monto) VALUES (?, ?, ?)';
  db.query(query, [cotizacion_id, descripcion, monto], (err, results) => {
    if (err) {
      console.error('Error al insertar costo adicional:', err);
      return res.status(500).json({ error: 'Error al insertar costo adicional' });
    }
    res.status(201).json({ message: 'Costo adicional insertado correctamente', id: results.insertId });
  });
};

exports.updateCostoAdicional = (req, res) => {
  const { id } = req.params;
  const { cotizacion_id, descripcion, monto } = req.body;
  const query = 'UPDATE costos_adicionales SET cotizacion_id = ?, descripcion = ?, monto = ? WHERE id = ?';
  db.query(query, [cotizacion_id, descripcion, monto, id], (err, results) => {
    if (err) {
      console.error('Error al actualizar costo adicional:', err);
      return res.status(500).json({ error: 'Error al actualizar costo adicional' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Costo adicional no encontrado' });
    }
    res.status(200).json({ message: 'Costo adicional actualizado correctamente' });
  });
};

exports.deleteCostoAdicional = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM costos_adicionales WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al eliminar costo adicional:', err);
      return res.status(500).json({ error: 'Error al eliminar costo adicional' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Costo adicional no encontrado' });
    }
    res.status(200).json({ message: 'Costo adicional eliminado correctamente' });
  });
};