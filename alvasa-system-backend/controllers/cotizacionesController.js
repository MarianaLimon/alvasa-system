const db = require('../config/db');

// ==============================
// CREAR COTIZACIÓN (robusto)
// ==============================
// controllers/cotizacionesController.js

exports.crearCotizacion = (req, res) => {
  // ── Helpers de normalización ────────────────────────────────────────────
  const toStr = v => (v === '' || v === undefined || v === null) ? null : String(v);
  const toNum = v => {
    if (v === '' || v === undefined || v === null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const toInt = v => {
    if (v === '' || v === undefined || v === null) return null;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  };
  const toDate = v => {
    if (!v) return null;                      // si viene vacío, manda NULL
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;     // evita "Incorrect date value: ''"
  };
  const toBool01 = v => (v ? 1 : 0);          // MySQL espera 0/1

  // ── Body ────────────────────────────────────────────────────────────────
  const b = req.body || {};

  const folio                 = toStr(b.folio);
  const cliente_id            = toInt(b.cliente_id);          // FK: requerido
  const empresa               = toStr(b.empresa);
  const fecha                 = toDate(b.fecha);
  const mercancia             = toStr(b.mercancia);
  const regimen               = toStr(b.regimen);
  const aduana                = toStr(b.aduana);
  const tipo_envio            = toStr(b.tipo_envio);
  const cantidad              = toNum(b.cantidad);
  const estatus               = toStr(b.estatus);
  const fraccion_igi          = toStr(b.fraccion_igi);
  const monto_comisionista    = toNum(b.monto_comisionista);
  const notas                 = toStr(b.notas);
  const propuesta             = toNum(b.propuesta);
  const total                 = toNum(b.total);
  const ahorro                = toNum(b.ahorro);

  const flete_origen_destino  = toStr(b.flete_origen_destino);
  const flete_concepto_1      = toStr(b.flete_concepto_1);
  const flete_valor_1         = toNum(b.flete_valor_1);
  const flete_concepto_2      = toStr(b.flete_concepto_2);
  const flete_valor_2         = toNum(b.flete_valor_2);
  const flete_concepto_3      = toStr(b.flete_concepto_3);
  const flete_valor_3         = toNum(b.flete_valor_3);
  const flete_total           = toNum(b.flete_total);

  const flete_seguro_mercancia = toBool01(b.flete_seguro_mercancia);
  const incoterm               = toStr(b.incoterm);
  const costo_despacho         = toNum(b.costo_despacho);

  // Valida mínimos (ajusta si necesitas más)
  if (!cliente_id) {
    return res.status(400).json({ error: 'cliente_id es requerido' });
  }

  const sql = `
    INSERT INTO cotizaciones (
      folio, cliente_id, empresa, fecha, mercancia, regimen, aduana,
      tipo_envio, cantidad, estatus, fraccion_igi, monto_comisionista,
      notas, propuesta, total, ahorro,
      flete_origen_destino, flete_concepto_1, flete_valor_1,
      flete_concepto_2, flete_valor_2, flete_concepto_3, flete_valor_3, flete_total,
      flete_seguro_mercancia, incoterm, costo_despacho
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  const params = [
    folio, cliente_id, empresa, fecha, mercancia, regimen, aduana,
    tipo_envio, cantidad, estatus, fraccion_igi, monto_comisionista,
    notas, propuesta, total, ahorro,
    flete_origen_destino, flete_concepto_1, flete_valor_1,
    flete_concepto_2, flete_valor_2, flete_concepto_3, flete_valor_3, flete_total,
    flete_seguro_mercancia, incoterm, costo_despacho
  ];

  // Mantiene callback-style como ya usas en el resto del proyecto
  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('❌ Error al guardar cotización:', err.sqlMessage || err);
      return res.status(500).json({
        error: 'Error al guardar cotización',
        detail: err.sqlMessage || String(err)
      });
    }
    // el front espera { id }
    const newId = (result && (result.insertId ?? result.id)) || null;
    return res.status(201).json({
      ok: true,
      message: 'Cotización guardada',
      id: newId,                 // <-- por si el front usa .id
      insertId: newId,           // <-- por si usa .insertId
      cotizacionId: newId,       // <-- por si usa .cotizacionId
      id_cotizacion: newId,      // <-- por si usa snake_case
      folio: folio || null
    });

  });
};


// ==============================
// OBTENER TODAS LAS COTIZACIONES (con filtros)
// ==============================
exports.obtenerTodas = (req, res) => {
  const { q = '', status = '', desde = '', hasta = '' } = req.query;

  const where = [];
  const params = [];

  // Texto: cliente, folio, empresa, mercancía (case-insensitive)
  if (q) {
    const like = `%${q.toLowerCase()}%`;
    where.push(`(
      LOWER(cli.nombre)  LIKE ?
      OR LOWER(cot.folio)   LIKE ?
      OR LOWER(cot.empresa) LIKE ?
      OR LOWER(cot.mercancia) LIKE ?
    )`);
    params.push(like, like, like, like);
  }

  // Estatus exacto (si lo mandas del front)
  if (status) {
    where.push(`cot.estatus = ?`);
    params.push(status);
  }

  // Fechas (usamos la columna de negocio 'cot.fecha')
  // - Soporta: solo desde, solo hasta, o ambos
  if (desde && hasta) {
    where.push(`DATE(cot.fecha) BETWEEN ? AND ?`);
    params.push(desde, hasta);
  } else if (desde) {
    where.push(`DATE(cot.fecha) >= ?`);
    params.push(desde);
  } else if (hasta) {
    where.push(`DATE(cot.fecha) <= ?`);
    params.push(hasta);
  }

  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

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
    ${whereSQL}
    ORDER BY cot.fecha DESC, cot.id DESC
  `;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error al obtener cotizaciones:', err);
      return res.status(500).json({ error: 'Error al obtener cotizaciones' });
    }
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
