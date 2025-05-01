const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Función para crear un cargo
const crearCargo = (req, res) => {
  const {
    cotizacion_id,
    terrestre,
    aereo,
    custodia,
    total_cargos,
    almacenajes,
    demoras,
    pernocta,
    burreo,
    flete_falso,
    servicio_no_realizado,
    seguro,
    total_cargos_extra
  } = req.body;

  const sql = `
    INSERT INTO cargos_cotizacion 
    (cotizacion_id, terrestre, aereo, custodia, total_cargos,
     almacenajes, demoras, pernocta, burreo, flete_falso, 
     servicio_no_realizado, seguro, total_cargos_extra)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    cotizacion_id,
    terrestre,
    aereo,
    custodia,
    total_cargos,
    almacenajes,
    demoras,
    pernocta,
    burreo,
    flete_falso,
    servicio_no_realizado,
    seguro,
    total_cargos_extra
  ], (err, result) => {
    if (err) {
      console.error('Error al insertar cargos:', err);
      return res.status(500).json({ error: 'Error al guardar cargos' });
    }
    res.status(201).json({ message: 'Cargos guardados correctamente', id: result.insertId });
  });
};

// Función para actualizar un cargo
const actualizarCargo = (req, res) => {
  const { id } = req.params;
  const {
    terrestre,
    aereo,
    custodia,
    total_cargos,
    almacenajes,
    demoras,
    pernocta,
    burreo,
    flete_falso,
    servicio_no_realizado,
    seguro,
    total_cargos_extra
  } = req.body;

  const sql = `
    UPDATE cargos_cotizacion SET
      terrestre = ?,
      aereo = ?,
      custodia = ?,
      total_cargos = ?,
      almacenajes = ?,
      demoras = ?,
      pernocta = ?,
      burreo = ?,
      flete_falso = ?,
      servicio_no_realizado = ?,
      seguro = ?,
      total_cargos_extra = ?
    WHERE cotizacion_id = ?
  `;

  db.query(sql, [
    terrestre,
    aereo,
    custodia,
    total_cargos,
    almacenajes,
    demoras,
    pernocta,
    burreo,
    flete_falso,
    servicio_no_realizado,
    seguro,
    total_cargos_extra,
    id
  ], (err) => {
    if (err) {
      console.error('Error al actualizar cargos:', err);
      return res.status(500).json({ error: 'Error al actualizar cargos' });
    }
    res.status(200).json({ message: 'Cargos actualizados correctamente' });
  });
};

// Exportar funciones
module.exports = { crearCargo, actualizarCargo };