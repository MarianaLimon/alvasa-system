const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Obtener todos los clientes
console.log("⚡ Ruta de clientes cargada correctamente");
router.get('/', async (req, res) => {
  try {
    // Realiza la consulta utilizando el pool
    pool.query('SELECT * FROM clientes', (err, results) => {
      if (err) {
        console.error('Error al obtener clientes', err);
        return res.status(500).send('Error al obtener clientes');
      }
      res.json(results);
    });
  } catch (error) {
    console.error('Error inesperado al obtener clientes', error);
    res.status(500).send('Error inesperado al obtener clientes');
  }
});

// Obtener un cliente por su id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    pool.query('SELECT * FROM clientes WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error al obtener el cliente', err);
        return res.status(500).send('Error al obtener el cliente');
      }
      if (results.length === 0) {
        return res.status(404).send('Cliente no encontrado');
      }
      res.json(results[0]);
    });
  } catch (error) {
    console.error('Error inesperado al obtener el cliente', error);
    res.status(500).send('Error inesperado al obtener el cliente');
  }
});

// Crear un nuevo cliente
router.post('/', async (req, res) => {
  const { nombre, direccion, telefono, email } = req.body;

  if (!nombre || !direccion || !telefono || !email) {
    return res.status(400).send('Todos los campos son requeridos');
  }

  try {
    pool.query(
      'INSERT INTO clientes (nombre, direccion, telefono, email) VALUES (?, ?, ?, ?)',
      [nombre, direccion, telefono, email],
      (err, results) => {
        if (err) {
          console.error('Error al agregar cliente', err);
          return res.status(500).send('Error al agregar cliente');
        }
        res.status(201).json({
          id: results.insertId,
          nombre,
          direccion,
          telefono,
          email
        });
      }
    );
  } catch (error) {
    console.error('Error inesperado al agregar cliente', error);
    res.status(500).send('Error inesperado al agregar cliente');
  }
});

// Actualizar un cliente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, direccion, telefono, email } = req.body;

  if (!nombre || !direccion || !telefono || !email) {
    return res.status(400).send('Todos los campos son requeridos');
  }

  try {
    pool.query(
      'UPDATE clientes SET nombre = ?, direccion = ?, telefono = ?, email = ? WHERE id = ?',
      [nombre, direccion, telefono, email, id],
      (err, results) => {
        if (err) {
          console.error('Error al actualizar cliente', err);
          return res.status(500).send('Error al actualizar cliente');
        }
        if (results.affectedRows === 0) {
          return res.status(404).send('Cliente no encontrado');
        }
        res.json({
          id,
          nombre,
          direccion,
          telefono,
          email
        });
      }
    );
  } catch (error) {
    console.error('Error inesperado al actualizar cliente', error);
    res.status(500).send('Error inesperado al actualizar cliente');
  }
});

// Eliminar un cliente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    pool.query('DELETE FROM clientes WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error al eliminar cliente', err);
        return res.status(500).send('Error al eliminar cliente');
      }
      if (results.affectedRows === 0) {
        return res.status(404).send('Cliente no encontrado');
      }
      res.send('Cliente eliminado correctamente');
    });
  } catch (error) {
    console.error('Error inesperado al eliminar cliente', error);
    res.status(500).send('Error inesperado al eliminar cliente');
  }
});

module.exports = router;