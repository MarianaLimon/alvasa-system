const db = require('../config/db');

exports.getItemsCotizacion = (req, res) => {
  db.query('SELECT * FROM items_cotizacion', (err, results) => {
    if (err) {
      console.error('Error al obtener items de cotización:', err);
      return res.status(500).json({ error: 'Error al obtener los items de cotización' });
    }
    res.json(results);
  });
};

exports.createItemCotizacion = (req, res) => {
  const { cotizacion_id, producto, cantidad, precio_unitario, total } = req.body;
  const query = 'INSERT INTO items_cotizacion (cotizacion_id, producto, cantidad, precio_unitario, total) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [cotizacion_id, producto, cantidad, precio_unitario, total], (err, results) => {
    if (err) {
      console.error('Error al insertar item de cotización:', err);
      return res.status(500).json({ error: 'Error al insertar item de cotización' });
    }
    res.status(201).json({ message: 'Item de cotización insertado correctamente', id: results.insertId });
  });
};

exports.updateItemCotizacion = (req, res) => {
  const { id } = req.params;
  const { cotizacion_id, producto, cantidad, precio_unitario, total } = req.body;
  const query = 'UPDATE items_cotizacion SET cotizacion_id = ?, producto = ?, cantidad = ?, precio_unitario = ?, total = ? WHERE id = ?';
  db.query(query, [cotizacion_id, producto, cantidad, precio_unitario, total, id], (err, results) => {
    if (err) {
      console.error('Error al actualizar item de cotización:', err);
      return res.status(500).json({ error: 'Error al actualizar item de cotización' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Item de cotización no encontrado' });
    }
    res.status(200).json({ message: 'Item de cotización actualizado correctamente' });
  });
};

exports.deleteItemCotizacion = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM items_cotizacion WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al eliminar item de cotización:', err);
      return res.status(500).json({ error: 'Error al eliminar item de cotización' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Item de cotización no encontrado' });
    }
    res.status(200).json({ message: 'Item de cotización eliminado correctamente' });
  });
};