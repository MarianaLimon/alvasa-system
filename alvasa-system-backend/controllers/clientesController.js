const db = require('../config/db');

// ==========================
// OBTENER TODOS LOS CLIENTES
// ==========================
exports.getClientes = (req, res) => {
  db.query('SELECT * FROM clientes', (err, results) => {
    if (err) {
      console.error('Error al obtener clientes:', err);
      return res.status(500).json({ error: 'Error al obtener los clientes' });
    }
    res.json(results);
  });
};

// ==========================
// CREAR CLIENTE
// ==========================
exports.createCliente = (req, res) => {
  const { nombre, direccion = '', telefono = '', email = '' } = req.body;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  const query = 'INSERT INTO clientes (nombre, direccion, telefono, email) VALUES (?, ?, ?, ?)';
  db.query(query, [nombre, direccion, telefono, email], (err, results) => {
    if (err) {
      console.error('Error al insertar cliente:', err);
      return res.status(500).json({ error: 'Error al insertar cliente' });
    }
    res.status(201).json({ message: 'Cliente insertado correctamente', id: results.insertId });
  });
};

// ==========================
// ACTUALIZAR CLIENTE
// ==========================
exports.updateCliente = (req, res) => {
  const { id } = req.params;
  const { nombre, direccion = '', telefono = '', email = '' } = req.body;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  const query = 'UPDATE clientes SET nombre = ?, direccion = ?, telefono = ?, email = ? WHERE id = ?';
  db.query(query, [nombre, direccion, telefono, email, id], (err, results) => {
    if (err) {
      console.error('Error al actualizar cliente:', err);
      return res.status(500).json({ error: 'Error al actualizar cliente' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.status(200).json({ message: 'Cliente actualizado correctamente' });
  });
};

// ==========================
// ELIMINAR CLIENTE
// ==========================
exports.deleteCliente = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM clientes WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al eliminar cliente:', err);
      return res.status(500).json({ error: 'Error al eliminar cliente' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.status(200).json({ message: 'Cliente eliminado correctamente' });
  });
};