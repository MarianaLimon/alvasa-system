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

// Exportar la función
module.exports = { crearCargo };