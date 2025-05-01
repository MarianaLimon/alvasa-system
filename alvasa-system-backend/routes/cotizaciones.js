const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ------------------------------
// CREAR COTIZACIÓN
// ------------------------------
router.post('/', (req, res) => {
  const {
    folio, cliente_id, empresa, fecha, mercancia, regimen, aduana, tipo_envio,
    cantidad, estatus, fraccion_igi, monto_comisionista, notas, propuesta, total,
    ahorro, flete_origen_destino, flete_concepto_1, flete_valor_1,
    flete_concepto_2, flete_valor_2, flete_concepto_3, flete_valor_3, flete_total
  } = req.body;

  const sql = `
    INSERT INTO cotizaciones (
      folio, cliente_id, empresa, fecha, mercancia, regimen, aduana,
      tipo_envio, cantidad, estatus, fraccion_igi, monto_comisionista,
      notas, propuesta, total, ahorro,
      flete_origen_destino, flete_concepto_1, flete_valor_1,
      flete_concepto_2, flete_valor_2, flete_concepto_3, flete_valor_3, flete_total
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    folio, cliente_id, empresa, fecha, mercancia, regimen, aduana,
    tipo_envio, cantidad, estatus, fraccion_igi, monto_comisionista, notas, propuesta,
    total, ahorro, flete_origen_destino, flete_concepto_1, flete_valor_1,
    flete_concepto_2, flete_valor_2, flete_concepto_3, flete_valor_3, flete_total
  ], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al guardar cotización' });
    res.status(201).json({ message: 'Cotización guardada', id: result.insertId });
  });
});

// ------------------------------
// OBTENER TODAS LAS COTIZACIONES
// ------------------------------
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

// ------------------------------
// OBTENER UNA COTIZACIÓN COMPLETA POR ID
// ------------------------------
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const sqlCotizacion = `
    SELECT cot.*, cli.nombre AS cliente
    FROM cotizaciones cot
    LEFT JOIN clientes cli ON cot.cliente_id = cli.id
    WHERE cot.id = ?
  `;

  const sqlCargos = `SELECT * FROM cargos_cotizacion WHERE cotizacion_id = ?`;
  const sqlServicios = `SELECT * FROM servicios_cotizacion WHERE cotizacion_id = ?`;
  const sqlCuentaGastos = `SELECT * FROM cuenta_gastos_cotizacion WHERE cotizacion_id = ?`;
  const sqlPedimento = `SELECT * FROM pedimentos_cotizacion WHERE cotizacion_id = ?`;
  const sqlDesgloseImpuestos = `SELECT * FROM desglose_impuestos_cotizacion WHERE cotizacion_id = ?`;

  db.query(sqlCotizacion, [id], (err, cotizacionResult) => {
    if (err) return res.status(500).json({ error: 'Error al obtener cotización' });
    if (cotizacionResult.length === 0) return res.status(404).json({ error: 'Cotización no encontrada' });

    const cotizacion = cotizacionResult[0];

    db.query(sqlCargos, [id], (err, cargosResult) => {
      if (err) return res.status(500).json({ error: 'Error al obtener cargos' });

      db.query(sqlServicios, [id], (err, serviciosResult) => {
        if (err) return res.status(500).json({ error: 'Error al obtener servicios' });

        db.query(sqlCuentaGastos, [id], (err, cuentaGastosResult) => {
          if (err) return res.status(500).json({ error: 'Error al obtener cuenta de gastos' });

          db.query(sqlPedimento, [id], (err, pedimentoResult) => {
            if (err) return res.status(500).json({ error: 'Error al obtener pedimento' });

            db.query(sqlDesgloseImpuestos, [id], (err, desgloseImpuestosResult) => {
              if (err) return res.status(500).json({ error: 'Error al obtener desglose de impuestos' });

              cotizacion.cargos = cargosResult;
              cotizacion.servicios = serviciosResult;
              cotizacion.cuentaGastos = cuentaGastosResult;
              cotizacion.pedimento = pedimentoResult.length > 0 ? pedimentoResult[0] : null;
              cotizacion.desgloseImpuestos = desgloseImpuestosResult;

              res.status(200).json(cotizacion);
            });
          });
        });
      });
    });
  });
});

// ------------------------------
// ACTUALIZAR COTIZACIÓN PRINCIPAL
// ------------------------------
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    folio, cliente_id, empresa, fecha, mercancia, regimen, aduana, tipo_envio,
    cantidad, estatus, fraccion_igi, monto_comisionista, notas, propuesta, total,
    ahorro, flete_origen_destino, flete_concepto_1, flete_valor_1,
    flete_concepto_2, flete_valor_2, flete_concepto_3, flete_valor_3, flete_total
  } = req.body;

  const sql = `
    UPDATE cotizaciones SET
      folio = ?, cliente_id = ?, empresa = ?, fecha = ?, mercancia = ?, regimen = ?, aduana = ?, tipo_envio = ?,
      cantidad = ?, estatus = ?, fraccion_igi = ?, monto_comisionista = ?, notas = ?, propuesta = ?, total = ?, ahorro = ?,
      flete_origen_destino = ?, flete_concepto_1 = ?, flete_valor_1 = ?,
      flete_concepto_2 = ?, flete_valor_2 = ?, flete_concepto_3 = ?, flete_valor_3 = ?, flete_total = ?
    WHERE id = ?
  `;

  db.query(sql, [
    folio, cliente_id, empresa, fecha, mercancia, regimen, aduana, tipo_envio,
    cantidad, estatus, fraccion_igi, monto_comisionista, notas, propuesta,
    total, ahorro, flete_origen_destino, flete_concepto_1, flete_valor_1,
    flete_concepto_2, flete_valor_2, flete_concepto_3, flete_valor_3, flete_total,
    id
  ], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar cotización' });
    res.json({ message: 'Cotización actualizada correctamente' });
  });
});

// ------------------------------
// ACTUALIZAR SUBFORMULARIOS
// ------------------------------
router.put('/cargos/:id', (req, res) => {
  const { id } = req.params;
  const {
    terrestre, aereo, custodia, total_cargos,
    almacenajes, demoras, pernocta, burreo,
    flete_falso, servicio_no_realizado, seguro, total_cargos_extra
  } = req.body;

  const sql = `
    UPDATE cargos_cotizacion SET
      terrestre = ?, aereo = ?, custodia = ?, total_cargos = ?,
      almacenajes = ?, demoras = ?, pernocta = ?, burreo = ?,
      flete_falso = ?, servicio_no_realizado = ?, seguro = ?, total_cargos_extra = ?
    WHERE cotizacion_id = ?
  `;

  db.query(sql, [
    terrestre, aereo, custodia, total_cargos,
    almacenajes, demoras, pernocta, burreo,
    flete_falso, servicio_no_realizado, seguro, total_cargos_extra,
    id
  ], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar cargos' });
    res.json({ message: 'Cargos actualizados correctamente' });
  });
});

router.put('/servicios/:id', (req, res) => {
  const { id } = req.params;
  const {
    maniobras, revalidacion, gestionDestino, inspeccionPeritaje,
    documentacionImportacion, garantiaContenedores, distribucion,
    serentyPremium, total
  } = req.body;

  const sql = `
    UPDATE servicios_cotizacion SET
      maniobras = ?, revalidacion = ?, gestionDestino = ?, inspeccionPeritaje = ?,
      documentacionImportacion = ?, garantiaContenedores = ?, distribucion = ?,
      serentyPremium = ?, total = ?
    WHERE cotizacion_id = ?
  `;

  db.query(sql, [
    maniobras, revalidacion, gestionDestino, inspeccionPeritaje,
    documentacionImportacion, garantiaContenedores, distribucion,
    serentyPremium, total, id
  ], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar servicios' });
    res.json({ message: 'Servicios actualizados correctamente' });
  });
});

router.put('/cuenta-gastos/:id', (req, res) => {
  const { id } = req.params;
  const {
    honorarios, padron, serviciosComplementarios,
    manejoCarga, subtotal, iva, total
  } = req.body;

  const sql = `
    UPDATE cuenta_gastos_cotizacion SET
      honorarios = ?, padron = ?, serviciosComplementarios = ?,
      manejoCarga = ?, subtotal = ?, iva = ?, total = ?
    WHERE cotizacion_id = ?
  `;

  db.query(sql, [
    honorarios, padron, serviciosComplementarios,
    manejoCarga, subtotal, iva, total, id
  ], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar cuenta de gastos' });
    res.json({ message: 'Cuenta de gastos actualizada correctamente' });
  });
});

router.put('/pedimentos/:id', (req, res) => {
  const { id } = req.params;
  const {
    tipoCambio, pesoBruto, valorAduana, dta,
    ivaPrv, igiIge, prv, iva, total
  } = req.body;

  const sql = `
    UPDATE pedimentos_cotizacion SET
      tipoCambio = ?, pesoBruto = ?, valorAduana = ?, dta = ?,
      ivaPrv = ?, igiIge = ?, prv = ?, iva = ?, total = ?
    WHERE cotizacion_id = ?
  `;

  db.query(sql, [
    tipoCambio, pesoBruto, valorAduana, dta,
    ivaPrv, igiIge, prv, iva, total, id
  ], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar pedimento' });
    res.json({ message: 'Pedimento actualizado correctamente' });
  });
});

router.put('/desglose-impuestos/:id', (req, res) => {
  const { id } = req.params;
  const {
    valorFactura, flete, tipoCambio, dta,
    igi, iva, prv, ivaPrv, total
  } = req.body;

  const sql = `
    UPDATE desglose_impuestos_cotizacion SET
      valorFactura = ?, flete = ?, tipoCambio = ?, dta = ?,
      igi = ?, iva = ?, prv = ?, ivaPrv = ?, total = ?
    WHERE cotizacion_id = ?
  `;

  db.query(sql, [
    valorFactura, flete, tipoCambio, dta,
    igi, iva, prv, ivaPrv, total, id
  ], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar desglose de impuestos' });
    res.json({ message: 'Desglose de impuestos actualizado correctamente' });
  });
});

// ------------------------------
// ELIMINAR COTIZACIÓN
// ------------------------------
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM cotizaciones WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar cotización:', err);
      return res.status(500).json({ error: 'Error al eliminar cotización' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cotización no encontrada' });
    }
    res.json({ message: 'Cotización eliminada correctamente' });
  });
});

module.exports = router;