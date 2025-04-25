const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Crear una cotización
router.post('/', (req, res) => {
  const {
    folio,
    cliente_id,
    empresa,
    fecha,
    mercancia,
    regimen,
    aduana,
    tipoEnvio,
    cantidad,
    estatus,
    fraccion_igi,
    monto_comisionista,
    notas,
    propuesta,
    total,
    ahorro
  } = req.body;

  const sql = `
    INSERT INTO cotizaciones 
    (folio, cliente_id, empresa, fecha, mercancia, regimen, aduana, tipo_envio, cantidad, estatus,
     fraccion_igi, monto_comisionista, notas, propuesta, total, ahorro) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    folio,
    cliente_id,
    empresa,
    fecha,
    mercancia,
    regimen,
    aduana,
    tipoEnvio,
    cantidad,
    estatus,
    fraccion_igi,
    monto_comisionista,
    notas,
    propuesta,
    total,
    ahorro
  ], (err, result) => {
    if (err) {
      console.error('Error al insertar cotización:', err);
      return res.status(500).json({ error: 'Error al guardar cotización' });
    }
    res.status(201).json({ message: 'Cotización guardada', id: result.insertId });
  });
});

// Obtener todas las cotizaciones
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      cot.id,
      cot.folio,
      cli.nombre AS cliente,
      cot.empresa,
      cot.fecha,
      cot.mercancia,
      cot.regimen,
      cot.aduana,
      cot.tipo_envio,
      cot.cantidad,
      cot.estatus,
      cot.fraccion_igi,
      cot.monto_comisionista,
      cot.notas,
      cot.propuesta,
      cot.total,
      cot.ahorro,
      cot.fecha_creacion
    FROM cotizaciones cot
    LEFT JOIN clientes cli ON cot.cliente_id = cli.id
    ORDER BY cot.fecha_creacion DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener cotizaciones:', err);
      return res.status(500).json({ error: 'Error al obtener cotizaciones' });
    }
    res.status(200).json(results);
  });
});

// ✅ Esta es la ruta correcta y debe estar FUERA de cualquier otra
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT 
      cot.*,
      cli.nombre AS cliente
    FROM cotizaciones cot
    LEFT JOIN clientes cli ON cot.cliente_id = cli.id
    WHERE cot.id = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener cotización:', err);
      return res.status(500).json({ error: 'Error al obtener cotización' });
    }
    if (results.length === 0) return res.status(404).json({ error: 'Cotización no encontrada' });
    res.status(200).json(results[0]);
  });
});

module.exports = router;