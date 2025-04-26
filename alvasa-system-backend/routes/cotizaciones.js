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
    tipo_envio,
    cantidad,
    estatus,
    fraccion_igi,
    monto_comisionista,
    notas,
    propuesta,
    total,
    ahorro,
    flete_origen_destino,
    flete_concepto_1,
    flete_valor_1,
    flete_concepto_2,
    flete_valor_2,
    flete_concepto_3,
    flete_valor_3,
    flete_total,
  } = req.body;

  const sql = `
    INSERT INTO cotizaciones 
    (folio, cliente_id, empresa, fecha, mercancia, regimen, aduana, tipo_envio, cantidad, estatus,
     fraccion_igi, monto_comisionista, notas, propuesta, total, ahorro,
     flete_origen_destino, flete_concepto_1, flete_valor_1, flete_concepto_2, flete_valor_2,
     flete_concepto_3, flete_valor_3, flete_total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    folio,
    cliente_id,
    empresa,
    fecha,
    mercancia,
    regimen,
    aduana,
    tipo_envio,
    cantidad,
    estatus,
    fraccion_igi,
    monto_comisionista,
    notas,
    propuesta,
    total,
    ahorro,
    flete_origen_destino,
    flete_concepto_1,
    flete_valor_1,
    flete_concepto_2,
    flete_valor_2,
    flete_concepto_3,
    flete_valor_3,
    flete_total
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

// Obtener una cotización específica (con cargos)
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const sqlCotizacion = `
    SELECT 
      cot.*,
      cli.nombre AS cliente
    FROM cotizaciones cot
    LEFT JOIN clientes cli ON cot.cliente_id = cli.id
    WHERE cot.id = ?
  `;

  const sqlCargos = `
    SELECT * FROM cargos_cotizacion WHERE cotizacion_id = ?
  `;

  const sqlServicios = `
    SELECT * FROM servicios_cotizacion WHERE cotizacion_id = ?
  `;

  const sqlCuentaGastos = `
  SELECT * FROM cuenta_gastos_cotizacion WHERE cotizacion_id = ?
  `;

   //  Obtener cotización
  db.query(sqlCotizacion, [id], (err, cotizacionResult) => {
    if (err) {
      console.error('Error al obtener cotización:', err);
      return res.status(500).json({ error: 'Error al obtener cotización' });
    }

    if (cotizacionResult.length === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }

    const cotizacion = cotizacionResult[0];

    db.query(sqlCargos, [id], (err, cargosResult) => {
      if (err) {
        console.error('Error al obtener cargos:', err);
        return res.status(500).json({ error: 'Error al obtener cargos' });
      }

      db.query(sqlServicios, [id], (err, serviciosResult) => {
        if (err) {
          console.error('Error al obtener servicios:', err);
          return res.status(500).json({ error: 'Error al obtener servicios' });
        }
        db.query(sqlCuentaGastos, [id], (err, cuentaGastosResult) => {
          if (err) {
            console.error('Error al obtener cuenta de gastos:', err);
            return res.status(500).json({ error: 'Error al obtener cuenta de gastos' });
          }

        // Agregamos cargos y servicios al objeto cotizacion
        cotizacion.cargos = cargosResult;
        cotizacion.servicios = serviciosResult;
        cotizacion.cuentaGastos = cuentaGastosResult;

        res.status(200).json(cotizacion);
        }); 
      });   
    });     
  });       
});

module.exports = router;