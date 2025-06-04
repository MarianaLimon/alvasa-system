const express = require('express');
const router = express.Router();
const {
  guardarAADespacho,
  obtenerAADespacho
} = require('../../controllers/asignacion-costos/aaDespachoController');

// Middleware opcional de validación de ID numérico
const validarIdNumerico = (req, res, next) => {
  const id = req.params.asignacionId;
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ mensaje: 'ID de asignación inválido' });
  }
  next();
};

// POST para guardar AA Despacho
router.post('/:asignacionId', validarIdNumerico, guardarAADespacho);

// GET para obtener AA Despacho
router.get('/:asignacionId', validarIdNumerico, obtenerAADespacho);

// PUT para actualizar AA Despacho
router.put('/:asignacionId', validarIdNumerico, guardarAADespacho);

module.exports = router;