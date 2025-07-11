const db = require('../config/db');

// ==============================
// CREAR COTIZACIÓN
// ==============================
exports.crearCotizacion = (req, res) => {
  const {
    folio, cliente_id, empresa, fecha, mercancia, regimen, aduana, tipo_envio,
    cantidad, estatus, fraccion_igi, monto_comisionista, notas, propuesta, total,
    ahorro, flete_origen_destino, flete_concepto_1, flete_valor_1,
    flete_concepto_2, flete_valor_2, flete_concepto_3, flete_valor_3, flete_total,
    flete_seguro_mercancia = false, incoterm, costo_despacho
  } = req.body;

  const sql = `
    INSERT INTO cotizaciones (
      folio, cliente_id, empresa, fecha, mercancia, regimen, aduana,
      tipo_envio, cantidad, estatus, fraccion_igi, monto_comisionista,
      notas, propuesta, total, ahorro,
      flete_origen_destino, flete_concepto_1, flete_valor_1,
      flete_concepto_2, flete_valor_2, flete_concepto_3, flete_valor_3, flete_total,
      flete_seguro_mercancia, incoterm, costo_despacho
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    folio, cliente_id, empresa, fecha, mercancia, regimen, aduana,
    tipo_envio, cantidad, estatus, fraccion_igi, monto_comisionista, notas, propuesta,
    total, ahorro, flete_origen_destino, flete_concepto_1, flete_valor_1,
    flete_concepto_2, flete_valor_2, flete_concepto_3, flete_valor_3, flete_total,
    flete_seguro_mercancia, incoterm, costo_despacho
  ], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al guardar cotización' });
    res.status(201).json({ message: 'Cotización guardada', id: result.insertId });
  });
};


// ==============================
// OBTENER TODAS LAS COTIZACIONES
// ==============================
exports.obtenerTodas = (req, res) => {
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
      cot.incoterm,
      cot.fraccion_igi,
      cot.monto_comisionista,
      cot.notas,
      cot.propuesta,
      cot.costo_despacho,
      cot.total,
      cot.ahorro,
      cot.flete_seguro_mercancia,
      cot.fecha_creacion
    FROM cotizaciones cot
    LEFT JOIN clientes cli ON cot.cliente_id = cli.id
    ORDER BY cot.fecha_creacion DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener cotizaciones' });
    res.status(200).json(results);
  });
};

// ==============================
// OBTENER COTIZACIÓN COMPLETA POR ID
// ==============================
exports.obtenerPorId = (req, res) => {
  const id = req.params.id;
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

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

  db.query(sqlCotizacion, [id], (err, cotRes) => {
    if (err) return res.status(500).json({ error: 'Error al obtener cotización' });
    if (cotRes.length === 0) return res.status(404).json({ error: 'Cotización no encontrada' });

    const cotizacion = cotRes[0];

    db.query(sqlCargos, [id], (err, cargos) => {
      if (err) return res.status(500).json({ error: 'Error al obtener cargos' });

      db.query(sqlServicios, [id], (err, servicios) => {
        if (err) return res.status(500).json({ error: 'Error al obtener servicios' });

        db.query(sqlCuentaGastos, [id], (err, gastos) => {
          if (err) return res.status(500).json({ error: 'Error al obtener cuenta de gastos' });

          db.query(sqlPedimento, [id], (err, pedimento) => {
            if (err) return res.status(500).json({ error: 'Error al obtener pedimento' });

            db.query(sqlDesgloseImpuestos, [id], (err, desglose) => {
              if (err) return res.status(500).json({ error: 'Error al obtener desglose de impuestos' });

              cotizacion.cargos = cargos;
              cotizacion.servicios = servicios;
              cotizacion.cuentaGastos = gastos;
              cotizacion.pedimento = pedimento.length > 0 ? pedimento[0] : null;
              cotizacion.desgloseImpuestos = desglose;

              res.json(cotizacion);
            });
          });
        });
      });
    });
  });
};

// ==============================
// ACTUALIZAR COTIZACIÓN
// ==============================
exports.actualizarCotizacion = (req, res) => {
  const { id } = req.params;
  const {
    folio, cliente_id, empresa, fecha, mercancia, regimen, aduana, tipo_envio,
    cantidad, estatus, fraccion_igi, monto_comisionista, notas, propuesta, total,
    ahorro, flete_origen_destino, flete_concepto_1, flete_valor_1,
    flete_concepto_2, flete_valor_2, flete_concepto_3, flete_valor_3, flete_total,
    flete_seguro_mercancia = false, incoterm, costo_despacho
  } = req.body;

  const sql = `
    UPDATE cotizaciones SET
      folio = ?, cliente_id = ?, empresa = ?, fecha = ?, mercancia = ?, regimen = ?, aduana = ?,
      tipo_envio = ?, cantidad = ?, estatus = ?, fraccion_igi = ?, monto_comisionista = ?, notas = ?,
      propuesta = ?, total = ?, ahorro = ?,
      flete_origen_destino = ?, flete_concepto_1 = ?, flete_valor_1 = ?,
      flete_concepto_2 = ?, flete_valor_2 = ?, flete_concepto_3 = ?, flete_valor_3 = ?, flete_total = ?,
      flete_seguro_mercancia = ?, incoterm = ?, costo_despacho = ?
    WHERE id = ?
  `;

  db.query(sql, [
    folio, cliente_id, empresa, fecha, mercancia, regimen, aduana,
    tipo_envio, cantidad, estatus, fraccion_igi, monto_comisionista, notas, propuesta,
    total, ahorro, flete_origen_destino, flete_concepto_1, flete_valor_1,
    flete_concepto_2, flete_valor_2, flete_concepto_3, flete_valor_3, flete_total,
    flete_seguro_mercancia, incoterm, costo_despacho,
    id
  ], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar cotización' });
    res.status(200).json({ message: 'Cotización actualizada correctamente' });
  });
};


// ==============================
// ELIMINAR COTIZACIÓN
// ==============================
exports.eliminarCotizacion = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM cotizaciones WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar cotización' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Cotización no encontrada' });
    res.status(200).json({ message: 'Cotización eliminada correctamente' });
  });
};

// ==============================
// OBTENER POR FOLIO (SOLO propuesta y comisión)
// ==============================
exports.obtenerPorFolio = (req, res) => {
  const folio = req.params.folio;

  const sql = `
    SELECT id, propuesta, monto_comisionista, flete_seguro_mercancia, costo_despacho
    FROM cotizaciones
    WHERE folio = ?
    LIMIT 1
  `;

  db.query(sql, [folio], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al buscar cotización' });
    if (results.length === 0) return res.status(404).json({ error: 'Cotización no encontrada' });
    res.json(results[0]);
  });
};

// ==============================
// SUBFORMULARIOS
// ==============================

// Cargos
exports.actualizarCargos = (req, res) => {
  const { id } = req.params;
  const cargos = req.body;

  db.query('DELETE FROM cargos_cotizacion WHERE cotizacion_id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al limpiar cargos' });

    if (cargos.length === 0) return res.status(200).json({ message: 'Cargos actualizados' });

    const values = cargos.map(c => [id, c.concepto, c.valor]);
    db.query('INSERT INTO cargos_cotizacion (cotizacion_id, concepto, valor) VALUES ?', [values], (err) => {
      if (err) return res.status(500).json({ error: 'Error al insertar cargos' });
      res.status(200).json({ message: 'Cargos actualizados' });
    });
  });
};

// Servicios
exports.actualizarServicios = (req, res) => {
  const { id } = req.params;
  const servicios = req.body;

  db.query('DELETE FROM servicios_cotizacion WHERE cotizacion_id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al limpiar servicios' });

    if (servicios.length === 0) return res.status(200).json({ message: 'Servicios actualizados' });

    const values = servicios.map(s => [id, s.concepto, s.valor]);
    db.query('INSERT INTO servicios_cotizacion (cotizacion_id, concepto, valor) VALUES ?', [values], (err) => {
      if (err) return res.status(500).json({ error: 'Error al insertar servicios' });
      res.status(200).json({ message: 'Servicios actualizados' });
    });
  });
};

// Cuenta de gastos
exports.actualizarCuentaGastos = (req, res) => {
  const { id } = req.params;
  const { honorarios, padron, complementarios, manejo_carga } = req.body;

  const sql = `
    INSERT INTO cuenta_gastos_cotizacion 
    (cotizacion_id, honorarios, padron, complementarios, manejo_carga)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      honorarios = VALUES(honorarios),
      padron = VALUES(padron),
      complementarios = VALUES(complementarios),
      manejo_carga = VALUES(manejo_carga)
  `;

  db.query(sql, [id, honorarios, padron, complementarios, manejo_carga], (err) => {
    if (err) return res.status(500).json({ error: 'Error al guardar cuenta de gastos' });
    res.status(200).json({ message: 'Cuenta de gastos actualizada' });
  });
};

// Pedimentos
exports.actualizarPedimentos = (req, res) => {
  const { id } = req.params;
  const ped = req.body;

  const sql = `
    INSERT INTO pedimentos_cotizacion (
      cotizacion_id, tipo_cambio, peso_bruto, valor_aduana,
      dta, iva_prv, igi_ige, prv, iva
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      tipo_cambio = VALUES(tipo_cambio),
      peso_bruto = VALUES(peso_bruto),
      valor_aduana = VALUES(valor_aduana),
      dta = VALUES(dta),
      iva_prv = VALUES(iva_prv),
      igi_ige = VALUES(igi_ige),
      prv = VALUES(prv),
      iva = VALUES(iva)
  `;

  db.query(sql, [
    id, ped.tipo_cambio, ped.peso_bruto, ped.valor_aduana,
    ped.dta, ped.iva_prv, ped.igi_ige, ped.prv, ped.iva
  ], (err) => {
    if (err) return res.status(500).json({ error: 'Error al guardar pedimento' });
    res.status(200).json({ message: 'Pedimento actualizado' });
  });
};

// Desglose de impuestos
exports.actualizarDesgloseImpuestos = (req, res) => {
  const { id } = req.params;
  const impuestos = req.body;

  db.query('DELETE FROM desglose_impuestos_cotizacion WHERE cotizacion_id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al limpiar desglose' });

    if (impuestos.length === 0) return res.status(200).json({ message: 'Desglose actualizado' });

    const values = impuestos.map(i => [id, i.tipo, i.valor]);
    db.query('INSERT INTO desglose_impuestos_cotizacion (cotizacion_id, tipo, valor) VALUES ?', [values], (err) => {
      if (err) return res.status(500).json({ error: 'Error al insertar desglose' });
      res.status(200).json({ message: 'Desglose actualizado' });
    });
  });
};
