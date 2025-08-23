const db = require('../config/db');
const { toCsv } = require('../utils/toCsv');
const {
  buildPagosProveedoresUnionSQL,
  buildPagosProveedoresUnionSQLLegacy, 
} = require('../utils/proveedoresUnion');

// ===== Helpers para nombres de archivo =====
const stamp = () => new Date().toISOString().slice(0, 10).replace(/-/g, '');
const csvName = (base) => `${base}_${stamp()}.csv`;

// === CSV: Pagos de Clientes / Data servicios (1 fila = 1 servicio) ===
exports.csvCobrosDataServicios = async (req, res) => {
  try {
    const sql = `
      SELECT 
        ec.id                                AS id,
        ec.id_estado_cuenta                  AS no_control,
        ec.folio_proceso                     AS folio_proceso,
        ec.contenedor                        AS no_contenedor,
        ec.cliente                           AS cliente,
        ec.mercancia                         AS mercancia,
        ec.tipo_carga                        AS tipo_carga,
        DATE(ec.fecha_entrega)               AS fecha_entrega,

        s.servicio                           AS servicio,
        s.giro                               AS giro,
        s.importe                            AS importe_por_servicio,

        ec.total                             AS total_de_servicios,
        COALESCE(ab.abonado_total, 0)        AS cantidad_abonada,
        ec.saldo                             AS saldo,
        ec.estatus                           AS estatus
      FROM estado_cuenta_clientes ec
      LEFT JOIN servicios_estado_cuenta s
        ON s.id_estado_cuenta = ec.id_estado_cuenta
      LEFT JOIN (
        SELECT id_estado_cuenta, SUM(abono) AS abonado_total
        FROM abonos_estado_cuenta
        GROUP BY id_estado_cuenta
      ) ab ON ab.id_estado_cuenta = ec.id_estado_cuenta
      WHERE s.id IS NOT NULL
      ORDER BY ec.id_estado_cuenta ASC, s.id ASC
    `;

    const [rows] = await db.promise().query(sql);

    const columns = [
      { key: 'id',                    label: 'ID' },
      { key: 'no_control',            label: 'No. Control' },
      { key: 'folio_proceso',         label: 'Folio Proceso' },
      { key: 'no_contenedor',         label: 'No. Contenedor' },
      { key: 'cliente',               label: 'Cliente' },
      { key: 'mercancia',             label: 'Mercancia' },
      { key: 'tipo_carga',            label: 'Tipo de carga' },
      { key: 'fecha_entrega',         label: 'Fecha de entrega' },
      { key: 'servicio',              label: 'Servicio' },
      { key: 'giro',                  label: 'Giro' },
      { key: 'importe_por_servicio',  label: 'Importe por servicio' },
      { key: 'total_de_servicios',    label: 'Total de servicios' },
      { key: 'cantidad_abonada',      label: 'Cantidad abonada' },
      { key: 'saldo',                 label: 'Saldo' },
      { key: 'estatus',               label: 'Estatus' },
    ];

    const csv = toCsv(rows, columns);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${csvName('cobros_data_servicios')}"`);
    res.send(csv);
  } catch (err) {
    console.error('CSV cobros servicios error:', err);
    res.status(500).json({ msg: 'Error al generar CSV (servicios)' });
  }
};

// === CSV: Pagos de Clientes / Data pagos (1 fila = 1 abono) ===
exports.csvCobrosDataPagos = async (req, res) => {
  try {
    const sql = `
      SELECT
        ec.id                               AS id,
        ec.id_estado_cuenta                 AS no_control,
        ec.folio_proceso                    AS folio_proceso,
        ec.contenedor                       AS no_contenedor,
        ec.cliente                          AS cliente,
        ec.mercancia                        AS mercancia,
        ec.tipo_carga                       AS tipo_carga,
        DATE(ec.fecha_entrega)              AS fecha_entrega,
        ec.total                            AS total_de_servicios,

        COALESCE(a.abono, 0)                AS cantidad_abonada,
        a.fecha_pago                        AS fecha_de_abono,
        a.tipo_transaccion                  AS tipo_de_transaccion,

        ec.abonado                          AS total_de_abonos,
        ec.saldo                            AS saldo,
        ec.estatus                          AS estatus
      FROM estado_cuenta_clientes ec
      LEFT JOIN abonos_estado_cuenta a
        ON a.id_estado_cuenta = ec.id_estado_cuenta
      ORDER BY
        ec.id_estado_cuenta ASC,
        (a.fecha_pago IS NULL) ASC,
        DATE(a.fecha_pago) ASC,
        a.id ASC
    `;
    const [rows] = await db.promise().query(sql);

    const columns = [
      { key: 'id',                 label: 'ID' },
      { key: 'no_control',         label: 'No. Control' },
      { key: 'folio_proceso',      label: 'Folio Proceso' },
      { key: 'no_contenedor',      label: 'No. Contenedor' },
      { key: 'cliente',            label: 'Cliente' },
      { key: 'mercancia',          label: 'Mercancia' },
      { key: 'tipo_carga',         label: 'tipo de carga' },
      { key: 'fecha_entrega',      label: 'Fecha de entrega' },
      { key: 'total_de_servicios', label: 'Total de servicios' },
      { key: 'cantidad_abonada',   label: 'Cantidad abonada' },
      { key: 'fecha_de_abono',     label: 'Fecha de abono' },
      { key: 'tipo_de_transaccion',label: 'Tipo de transaccion' },
      { key: 'total_de_abonos',    label: 'Total de Abonos' },
      { key: 'saldo',              label: 'Saldo' },
      { key: 'estatus',            label: 'Estatus' },
    ];

    const csv = toCsv(rows, columns);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${csvName('cobros_data_pagos')}"`);
    res.send(csv);
  } catch (err) {
    console.error('CSV cobros pagos error:', err);
    res.status(500).json({ msg: 'Error al generar CSV (pagos)' });
  }
};

// === CSV: Operaciones y cargos extra (stub inicial) ===
exports.csvOperacionesCargosExtra = async (req, res) => {
  try {
    const rows = []; // pendiente de definir
    const columns = [
      { key: 'folio_proceso', label: 'Folio Proceso' },
      { key: 'no_contenedor', label: 'No. Contenedor' },
      { key: 'cliente',       label: 'Cliente' },
      { key: 'concepto',      label: 'Concepto' },
      { key: 'importe',       label: 'Importe' },
      { key: 'venta',         label: 'Venta' },
    ];
    const csv = toCsv(rows, columns);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${csvName('operaciones_cargos_extra')}"`);
    res.send(csv);
  } catch (err) {
    console.error('CSV operaciones stub error:', err);
    res.status(500).json({ msg: 'Error al generar CSV (operaciones)' });
  }
};

// === CSV: Proveedores (general; 1 fila por abono, usando UNION del sistema) ===
exports.csvPagosProveedores = async (req, res) => {
  try {
    const { sql } = buildPagosProveedoresUnionSQL(); // versión que ya usas en la lista
    const [rows] = await db.promise().query(sql);

    const columns = [
      // Servicio / contexto
      { key: 'no_control',      label: 'No. Control' },
      { key: 'ejecutivo',       label: 'Ejecutivo' },
      { key: 'fecha',           label: 'Fecha' },
      { key: 'cliente',         label: 'Cliente' },
      { key: 'no_contenedor',   label: 'No. Contenedor' },
      { key: 'giro',            label: 'Giro' },
      { key: 'proveedor',       label: 'Proveedor' },
      { key: 'concepto',        label: 'Concepto' },

      // Importe del servicio (con conversión)
      { key: 'monto_original',  label: 'Monto Original por servicio' },
      { key: 'moneda',          label: 'Moneda' },
      { key: 'tipo_cambio',     label: 'Tipo de Cambio' },
      { key: 'monto_en_pesos',  label: 'Monto en Pesos del servicio' },

      // Pago asociado
      { key: 'pago_numero_control', label: 'Folio de Pago' },
      { key: 'pago_estatus',        label: 'Estatus por Servicio' },
      { key: 'pago_saldo',          label: 'Saldo por servicio' },

      // Abonos (1 fila por abono)
      { key: 'abono_monto',            label: 'Monto Abonado' },
      { key: 'abono_fecha_pago',       label: 'Fecha del Abono' },
      { key: 'abono_tipo_transaccion', label: 'Tipo de Transacción' },

      // Totales por control general (PAGO-00X)
      { key: 'monto_total_en_pesos',  label: 'Monto Total de servicios' },
      { key: 'total_abonado',         label: 'Total Abonado de servicios' },
      { key: 'saldo_total',           label: 'Saldo Total de servicios' },
      { key: 'estatus_general',       label: 'Estatus General' },
    ];

    const csv = toCsv(rows ?? [], columns);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${csvName('pagos_proveedores')}"`);
    res.status(200).send(csv);
  } catch (err) {
    console.error('CSV pagos proveedores error:', err);
    res.status(500).json({ error: 'Error generando CSV' });
  }
};

// === CSV: Proveedores — SOLO pagos realizados (1 fila por abono realizado) ===
exports.csvPagosRealizadosProveedores = async (req, res) => {
  try {
    const { desde, hasta, giro, proveedor } = req.query || {};
    const { sql } = buildPagosProveedoresUnionSQL();

    const [all] = await db.promise().query(sql);

    // --- Filtros en memoria ---
    const dDesde = desde ? new Date(`${desde}T00:00:00`) : null;
    const dHasta = hasta ? new Date(`${hasta}T23:59:59`) : null;
    const up = (v) => (v ?? '').toString().trim().toUpperCase();

    let rowsFilt = (all || []).filter(r => r.abono_monto != null && r.abono_monto !== '');

    if (giro)      rowsFilt = rowsFilt.filter(r => up(r.giro) === up(giro));
    if (proveedor) rowsFilt = rowsFilt.filter(r => up(r.proveedor) === up(proveedor));
    if (dDesde || dHasta) {
      rowsFilt = rowsFilt.filter(r => {
        const f = r.abono_fecha_pago ? new Date(r.abono_fecha_pago) : null;
        if (!f) return false;
        if (dDesde && f < dDesde) return false;
        if (dHasta && f > dHasta) return false;
        return true;
      });
    }

    rowsFilt.sort((a, b) =>
      (String(a.no_control).localeCompare(String(b.no_control)) ||
       new Date(a.abono_fecha_pago) - new Date(b.abono_fecha_pago))
    );

    // --- Normalizamos filas con keys simples ---
    const rowsOut = rowsFilt.map(r => ({
      no_control           : r.no_control,
      no_contenedor        : r.no_contenedor,
      giro                 : r.giro,
      proveedor            : r.proveedor,
      concepto             : r.concepto,
      monto_en_pesos       : Number(r.monto_en_pesos ?? r.monto_total_en_pesos ?? 0),

      pago_numero          : r.pago_numero_control,
      pago_estatus         : r.pago_estatus ?? r.estatus_general,

      abono_fecha          : r.abono_fecha_pago ? String(r.abono_fecha_pago).slice(0,10) : '',
      abono_tipo           : r.abono_tipo_transaccion || '',
      abono_monto          : Number(r.abono_monto || 0),
      pago_saldo           : Number((r.pago_saldo ?? r.saldo_total) || 0),

      // Totales por control (PAGO-00X)
      monto_total_en_pesos : Number(r.monto_total_en_pesos ?? 0),
      total_abonado        : Number(r.total_abonado ?? 0),
      saldo_total          : Number(r.saldo_total ?? 0),
      estatus_general      : r.estatus_general || '',
    }));

    const columns = [
      { key: 'no_control',           label: 'No. Control' },
      { key: 'no_contenedor',        label: 'No Contenedor' },
      { key: 'giro',                 label: 'Giro' },
      { key: 'proveedor',            label: 'Proveedor' },
      { key: 'concepto',             label: 'Concepto' },
      { key: 'monto_en_pesos',       label: 'Monto en Pesos' },
      { key: 'pago_numero',          label: 'Pago - Numero' },
      { key: 'pago_estatus',         label: 'Pago Estatus' },
      { key: 'abono_fecha',          label: 'Abono - Fecha' },
      { key: 'abono_tipo',           label: 'Abono - Tipo' },
      { key: 'abono_monto',          label: 'Abono - Monto' },
      { key: 'pago_saldo',           label: 'Pago Saldo' },
      // Totales por control general
      { key: 'monto_total_en_pesos', label: 'Monto Total de servicios' },
      { key: 'total_abonado',        label: 'Total Abonado de servicios' },
      { key: 'saldo_total',          label: 'Saldo Total de servicios' },
      { key: 'estatus_general',      label: 'Estatus General' },
    ];

    const csv = toCsv(rowsOut, columns);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${csvName('pagos_realizados_proveedores')}"`);
    res.status(200).send(csv);
  } catch (err) {
    console.error('CSV pagos realizados proveedores:', err);
    res.status(500).json({ mensaje: 'Error al generar csv', error: err.message });
  }
};

// === CSV: Procesos + Asignación (detalle completo por fila) ===
//
// === CSV: Procesos + Asignación + Costos (cada dato = 1 columna) ===

// === helpers locales (fechas dd/mm/yyyy) — sin desfase de zona horaria ===
const fmtDMY = (val) => {
  if (!val) return '';

  // 1) Si viene como 'YYYY-MM-DD' o 'YYYY-MM-DDTHH:mm:ss', formatear por partes
  if (typeof val === 'string') {
    const m = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const [, yyyy, mm, dd] = m;
      return `${dd}/${mm}/${yyyy}`;
    }
  }

  // 2) Fallback: usar UTC para evitar corrimiento por timezone
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
};
// === helpers ===
const N = (v) => {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return v;
  let s = String(v).trim();
  if (!s) return 0;
  s = s.replace(/[^\d.,\-]/g, '');           // quita símbolos
  const lc = s.lastIndexOf(','), ld = s.lastIndexOf('.');
  if (lc > ld) { s = s.replace(/\./g, '').replace(',', '.'); } // 1.234,56
  else { s = s.replace(/,/g, ''); }                             // 1,234.56
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

// === CSV: PO (completo) + Asignación (solo generales, sin duplicar campos) ===
// === CSV: PO (completo) + Asignación (generales + AA Despacho + Forwarder + Flete Terrestre con extras) ===
exports.csvProcesosAsignacionDetalle = async (req, res) => {
  try {
    const { desde, hasta, folio, cliente, estatus } = req.query || {};

    const where = [];
    const params = [];
    if (desde)   { where.push('DATE(po.fecha_alta) >= ?'); params.push(desde); }
    if (hasta)   { where.push('DATE(po.fecha_alta) <= ?'); params.push(hasta); }
    if (folio)   { where.push('po.folio_proceso = ?');     params.push(folio); }
    if (cliente) { where.push('UPPER(c.nombre) = UPPER(?)'); params.push(cliente); }
    if (estatus) { where.push('po.estatus = ?');           params.push(estatus); }

    const sql = `
      SELECT
        /* ===== PROCESO OPERATIVO (generales) ===== */
        po.id                         AS po_id,
        po.folio_proceso              AS folio_proceso,
        c.nombre                      AS cliente,
        po.doc_po,
        po.mercancia,
        po.fecha_alta,
        po.tipo_importacion,
        po.ejecutivo_cuenta,
        po.tipo_carga,
        po.valor_mercancia,
        po.etd,
        po.observaciones,
        po.estatus,
        po.estatus_codigo,
        po.links_drive,

        /* ===== INFORMACIÓN DE EMBARQUE ===== */
        ie.hbl,
        ie.no_contenedor,
        ie.shipper,
        ie.icoterm,
        ie.consignatario,
        ie.forwarde,
        ie.tipo,
        ie.peso_bl,
        ie.peso_real,
        ie.vessel,
        ie.naviera,
        ie.pol,
        ie.pais_origen,
        ie.pod,
        ie.pais_destino,

        /* ===== PROCESO REVALIDACIÓN ===== */
        pr.mbl,
        pr.eta,
        pr.descarga,
        pr.terminal,
        pr.revalidacion,
        pr.recepcion_envio_docs,

        /* ===== DATOS PEDIMENTO ===== */
        dp.pedimento,
        dp.pago_pedimento,
        dp.regimen,
        dp.aa_despacho,
        dp.agente_aduanal,

        /* ===== SALIDA / RETORNO ===== */
        sr.salida_aduana,
        sr.entrega,
        sr.f_max,
        sr.entrega_vacio,
        sr.condiciones_contenedor,
        sr.terminal_vacio,

        /* ===== ASIGNACIÓN (generales, sin duplicar lo de PO) ===== */
        ac.id           AS ac_id,
        ac.cliente_id   AS ac_cliente_id,

        /* ===== DESPACHO / COTIZACIÓN (4 primeros datos) ===== */
        des.cotizacion_folio              AS ac_folio_cotizacion,
        cot.monto_comisionista            AS ac_comision_intermediario,
        des.facturacion                   AS ac_facturacion,
        des.comision_socio                AS ac_comision_socio,

        /* ===== AA DESPACHO ===== */
        adc.aa_despacho        AS aa_proveedor,
        adc.importacion_costo  AS aa_importacion_costo,
        adc.importacion_venta  AS aa_importacion_venta,
        adc.almacenajes_costo  AS aa_almacenajes_costo,
        adc.almacenajes_venta  AS aa_almacenajes_venta,
        adc.servicio_costo     AS aa_servicio_costo,
        adc.servicio_venta     AS aa_servicio_venta,
        adc.tipo_servicio1     AS aa_tipo_servicio1,
        adc.costo_servicio1    AS aa_costo_servicio1,
        adc.venta_servicio1    AS aa_venta_servicio1,
        adc.tipo_servicio2     AS aa_tipo_servicio2,
        adc.costo_servicio2    AS aa_costo_servicio2,
        adc.venta_servicio2    AS aa_venta_servicio2,

        /* ===== FORWARDER ===== */
        fwc.forwarder               AS fwd_proveedor,
        fwc.asignado_por            AS fwd_quien_pagamos,
        fwc.consignatario           AS fwd_consignatario,
        fwc.naviera                 AS fwd_naviera,

        fwc.flete_internacional_costo AS fwd_flete_costo,
        fwc.flete_internacional_venta AS fwd_flete_venta,
        fwc.cargos_locales_costo      AS fwd_cargos_costo,
        fwc.cargos_locales_venta      AS fwd_cargos_venta,
        fwc.demoras_costo             AS fwd_demoras_costo,
        fwc.demoras_venta             AS fwd_demoras_venta,

        fwc.tipo_servicio_extra     AS fwd_extra_servicio,
        fwc.costo_servicio_extra    AS fwd_extra_costo,
        fwc.venta_servicio_extra    AS fwd_extra_venta,

        fwc.abonado                 AS fwd_abonado,
        fwc.fecha_abon              AS fwd_fecha_abono,
        fwc.rembolsado              AS fwd_reembolsado,  -- ojo: 'rembolsado' en tu esquema
        fwc.fecha_remb              AS fwd_fecha_reembolso,

        /* ===== FLETE TERRESTRE ===== */
        ftc.id                      AS ft_id,
        ftc.proveedor              AS flete_proveedor,
        ftc.flete                  AS flete_costo,
        ftc.flete_venta            AS flete_venta,
        ftc.estadia                AS flete_estadia_costo,
        ftc.estadia_venta          AS flete_estadia_venta,
        ftc.burreo                 AS flete_burreo_costo,
        ftc.burreo_venta           AS flete_burreo_venta,
        ftc.sobrepeso              AS flete_sobrepeso_costo,
        ftc.sobrepeso_venta        AS flete_sobrepeso_venta,
        ftc.apoyo                  AS flete_apoyo_costo,
        ftc.apoyo_venta            AS flete_apoyo_venta,
        ftc.pernocta               AS flete_pernocta_costo,
        ftc.pernocta_venta         AS flete_pernocta_venta,

        /* ===== CUSTODIA ===== */
        ctc.custodia_proveedor           AS cust_proveedor,
        ctc.custodia_costo               AS cust_costo,
        ctc.custodia_venta               AS cust_venta,
        ctc.custodia_pernocta_costo      AS cust_pernocta_costo,
        ctc.custodia_pernocta_venta      AS cust_pernocta_venta,
        ctc.custodia_falso_costo         AS cust_falso_costo,
        ctc.custodia_falso_venta         AS cust_falso_venta,
        ctc.custodia_cancelacion_costo   AS cust_cancelacion_costo,
        ctc.custodia_cancelacion_venta   AS cust_cancelacion_venta,

         /* ===== PAQUETERÍA ===== */
        pc.empresa              AS paq_empresa,
        pc.costo                AS paq_costo,
        pc.venta                AS paq_venta,

        /* ===== ASEGURADORA ===== */
        aseg.aseguradora        AS aseg_aseguradora,
        aseg.valor_mercancia    AS aseg_valor_mercancia,
        aseg.costo              AS aseg_costo,
        aseg.venta              AS aseg_venta

      FROM procesos_operativos po
      LEFT JOIN clientes c                 ON c.id = po.cliente_id
      LEFT JOIN informacion_embarque ie    ON ie.proceso_operativo_id = po.id
      LEFT JOIN proceso_revalidacion pr    ON pr.proceso_operativo_id = po.id
      LEFT JOIN datos_pedimento dp         ON dp.proceso_operativo_id = po.id
      LEFT JOIN salida_retorno_contenedor sr ON sr.proceso_operativo_id = po.id
      LEFT JOIN asignacion_costos ac       ON ac.proceso_operativo_id = po.id
      LEFT JOIN despacho_costos des        ON des.asignacion_id = ac.id
      LEFT JOIN cotizaciones cot           ON cot.folio = des.cotizacion_folio
      LEFT JOIN aa_despacho_costos adc     ON adc.asignacion_id = ac.id
      LEFT JOIN forwarder_costos fwc       ON fwc.asignacion_id = ac.id
      LEFT JOIN flete_terrestre_costos ftc ON ftc.asignacion_id = ac.id
      LEFT JOIN custodia_costos ctc   ON ctc.asignacion_id = ac.id
      LEFT JOIN paqueteria_costos   pc   ON pc.asignacion_id   = ac.id
      LEFT JOIN aseguradora_costos  aseg ON aseg.asignacion_id = ac.id

      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY po.id ASC
    `;

    // 1) Traemos todo lo base
    const [rowsRaw] = await db.promise().query(sql, params);

    // 2) Cargamos EXTRAS de flete para todos los FTs presentes y los pivotamos (hasta 5 extras)
    const ftIds = [...new Set((rowsRaw || []).map(r => r.ft_id).filter(Boolean))];
    let extrasByFt = new Map();
    if (ftIds.length) {
      const [extras] = await db.promise().query(
        `SELECT flete_terrestre_id, concepto, costo, venta
         FROM extras_flete_terrestre
         WHERE flete_terrestre_id IN (?)
         ORDER BY id ASC`, [ftIds]
      );
      extrasByFt = extras.reduce((m, x) => {
        const arr = m.get(x.flete_terrestre_id) || [];
        arr.push(x);
        m.set(x.flete_terrestre_id, arr);
        return m;
      }, new Map());
    }

    // 3) Formateamos filas
    const rows = (rowsRaw || []).map(r => {
      const links = r.links_drive
        ? String(r.links_drive).split('\n').map(s => s.trim()).filter(Boolean).join(' | ')
        : '';

      const hasAA  = !!(r.aa_proveedor);
      const hasFT  = !!(r.ft_id);

      // Extras Flete (hasta 5)
      const ex = extrasByFt.get(r.ft_id) || [];
      const ex1 = ex[0] || {}, ex2 = ex[1] || {}, ex3 = ex[2] || {}, ex4 = ex[3] || {}, ex5 = ex[4] || {};

      const hasCust =
          r.cust_proveedor != null ||
          r.cust_costo != null || r.cust_venta != null ||
          r.cust_pernocta_costo != null || r.cust_pernocta_venta != null ||
          r.cust_falso_costo != null || r.cust_falso_venta != null ||
          r.cust_cancelacion_costo != null || r.cust_cancelacion_venta != null;

      const hasPaq  = !!(r.paq_empresa || r.paq_costo || r.paq_venta);
      const hasAseg = !!(r.aseg_aseguradora || r.aseg_costo || r.aseg_venta || r.aseg_valor_mercancia);

      return {
        // ===== PO (generales)
        po_id: r.po_id,
        folio_proceso: r.folio_proceso || '',
        cliente: r.cliente || '',
        doc_po: r.doc_po || '',
        mercancia: r.mercancia || '',
        fecha_alta: fmtDMY(r.fecha_alta),
        tipo_importacion: r.tipo_importacion || '',
        ejecutivo_cuenta: r.ejecutivo_cuenta || '',
        tipo_carga: r.tipo_carga || '',
        valor_mercancia: r.valor_mercancia || '',
        etd: fmtDMY(r.etd),
        observaciones: r.observaciones || '',
        estatus: r.estatus || '',
        estatus_codigo: r.estatus_codigo || '',
        links_drive: links,

        // ===== Información de Embarque
        hbl: r.hbl || '',
        no_contenedor: r.no_contenedor || '',
        shipper: r.shipper || '',
        icoterm: r.icoterm || '',
        consignatario: r.consignatario || '',
        forwarde: r.forwarde || '',
        tipo: r.tipo || '',
        peso_bl: r.peso_bl || '',
        peso_real: r.peso_real || '',
        vessel: r.vessel || '',
        naviera: r.naviera || '',
        pol: r.pol || '',
        pais_origen: r.pais_origen || '',
        pod: r.pod || '',
        pais_destino: r.pais_destino || '',

        // ===== Proceso Revalidación
        mbl: r.mbl || '',
        eta: fmtDMY(r.eta),
        descarga: fmtDMY(r.descarga),
        terminal: r.terminal || '',
        revalidacion: fmtDMY(r.revalidacion),
        recepcion_envio_docs: fmtDMY(r.recepcion_envio_docs),

        // ===== Datos Pedimento
        pedimento: r.pedimento || '',
        pago_pedimento: r.pago_pedimento || '',
        regimen: r.regimen || '',
        aa_despacho: r.aa_despacho || '',
        agente_aduanal: r.agente_aduanal || '',

        // ===== Salida / Retorno
        salida_aduana: r.salida_aduana || '',
        entrega: fmtDMY(r.entrega),
        f_max: fmtDMY(r.f_max),
        entrega_vacio: fmtDMY(r.entrega_vacio),
        condiciones_contenedor: r.condiciones_contenedor || '',
        terminal_vacio: r.terminal_vacio || '',

        // ===== Asignación (solo generales)
        ac_id: r.ac_id || '',
        ac_cliente_id: r.ac_cliente_id || '',
        tiene_asignacion: r.ac_id ? 1 : 0,

        // ===== Despacho/Cotización (4 datos)
        ac_folio_cotizacion:        r.ac_folio_cotizacion || '',
        ac_comision_intermediario:  N(r.ac_comision_intermediario),
        ac_facturacion:             N(r.ac_facturacion),
        ac_comision_socio:          N(r.ac_comision_socio),

        // ===== AA Despacho (SERVICIO1-5)
        aa_giro:                 hasAA ? 'AA Despacho' : '',
        aa_proveedor:            r.aa_proveedor || '',
        aa_servicio1:            hasAA ? 'Importación' : '',
        aa_costo_importacion:    N(r.aa_importacion_costo),
        aa_venta_importacion:    N(r.aa_importacion_venta),
        aa_servicio2:            hasAA ? 'Almacenajes' : '',
        aa_costo_almacenajes:    N(r.aa_almacenajes_costo),
        aa_venta_almacenajes:    N(r.aa_almacenajes_venta),
        aa_servicio3:            hasAA ? 'SERV. PRG. MO EJEC.' : '',
        aa_costo_serv_prg_mo_ejec: N(r.aa_servicio_costo),
        aa_venta_serv_prg_mo_ejec: N(r.aa_servicio_venta),
        aa_servicio4:            r.aa_tipo_servicio1 || '',
        aa_costo_servicio4:      N(r.aa_costo_servicio1),
        aa_venta_servicio4:      N(r.aa_venta_servicio1),
        aa_servicio5:            r.aa_tipo_servicio2 || '',
        aa_costo_servicio5:      N(r.aa_costo_servicio2),
        aa_venta_servicio5:      N(r.aa_venta_servicio2),

        // ===== Forwarder (ya existía; no piden pivot extra múltiple)
        fwd_proveedor:           r.fwd_proveedor || '',
        fwd_quien_pagamos:       r.fwd_quien_pagamos || '',
        fwd_consignatario:       r.fwd_consignatario || '',
        fwd_naviera:             r.fwd_naviera || '',
        fwd_flete_costo:         N(r.fwd_flete_costo),
        fwd_flete_venta:         N(r.fwd_flete_venta),
        fwd_cargos_costo:        N(r.fwd_cargos_costo),
        fwd_cargos_venta:        N(r.fwd_cargos_venta),
        fwd_demoras_costo:       N(r.fwd_demoras_costo),
        fwd_demoras_venta:       N(r.fwd_demoras_venta),
        fwd_extra_servicio:      r.fwd_extra_servicio || '',
        fwd_extra_costo:         N(r.fwd_extra_costo),
        fwd_extra_venta:         N(r.fwd_extra_venta),
        fwd_abonado:             N(r.fwd_abonado),
        fwd_fecha_abono:         fmtDMY(r.fwd_fecha_abono),
        fwd_reembolsado:         N(r.fwd_reembolsado),
        fwd_fecha_reembolso:     fmtDMY(r.fwd_fecha_reembolso),

        // ===== Flete Terrestre (normales)
        flete_giro:                hasFT ? 'Flete Terrestre' : '',
        flete_proveedor:           r.flete_proveedor || '',
        flete_costo:               N(r.flete_costo),
        flete_venta:               N(r.flete_venta),
        flete_estadia_costo:       N(r.flete_estadia_costo),
        flete_estadia_venta:       N(r.flete_estadia_venta),
        flete_burreo_costo:        N(r.flete_burreo_costo),
        flete_burreo_venta:        N(r.flete_burreo_venta),
        flete_sobrepeso_costo:     N(r.flete_sobrepeso_costo),
        flete_sobrepeso_venta:     N(r.flete_sobrepeso_venta),
        flete_apoyo_costo:         N(r.flete_apoyo_costo),
        flete_apoyo_venta:         N(r.flete_apoyo_venta),
        flete_pernocta_costo:      N(r.flete_pernocta_costo),
        flete_pernocta_venta:      N(r.flete_pernocta_venta),

        // ===== Flete Terrestre (EXTRAS: 5 pares servicio/costo/venta)
        flete_extra1:              ex1.concepto || '',
        flete_extra1_costo:        N(ex1.costo),
        flete_extra1_venta:        N(ex1.venta),

        flete_extra2:              ex2.concepto || '',
        flete_extra2_costo:        N(ex2.costo),
        flete_extra2_venta:        N(ex2.venta),

        flete_extra3:              ex3.concepto || '',
        flete_extra3_costo:        N(ex3.costo),
        flete_extra3_venta:        N(ex3.venta),

        flete_extra4:              ex4.concepto || '',
        flete_extra4_costo:        N(ex4.costo),
        flete_extra4_venta:        N(ex4.venta),

        flete_extra5:              ex5.concepto || '',
        flete_extra5_costo:        N(ex5.costo),
        flete_extra5_venta:        N(ex5.venta),

        // === CUSTODIA ===
        cust_giro:                 hasCust ? 'Custodia' : '',
        cust_proveedor:            r.cust_proveedor || '',

        // SERVICIO1: Custodia
        cust_servicio1:            hasCust ? 'Custodia' : '',
        cust_costo_custodia:       N(r.cust_costo),
        cust_venta_custodia:       N(r.cust_venta),

        // SERVICIO2: Pernocta de Custodia
        cust_servicio2:            hasCust ? 'Pernocta de Custodia' : '',
        cust_costo_pernocta:       N(r.cust_pernocta_costo),
        cust_venta_pernocta:       N(r.cust_pernocta_venta),

        // SERVICIO3: Custodia en Falso
        cust_servicio3:            hasCust ? 'Custodia en Falso' : '',
        cust_costo_falso:          N(r.cust_falso_costo),
        cust_venta_falso:          N(r.cust_falso_venta),

        // SERVICIO4: Cancelación de Custodia
        cust_servicio4:            hasCust ? 'Cancelación de Custodia' : '',
        cust_costo_cancelacion:    N(r.cust_cancelacion_costo),
        cust_venta_cancelacion:    N(r.cust_cancelacion_venta),

        // ---- Paquetería
        paq_giro:           hasPaq ? 'Paquetería' : '',
        paq_empresa:        r.paq_empresa || '',
        paq_costo:          N(r.paq_costo),
        paq_venta:          N(r.paq_venta),

        // ---- Aseguradora
        aseg_giro:          hasAseg ? 'Aseguradora' : '',
        aseg_aseguradora:   r.aseg_aseguradora || '',
        aseg_valor_mercancia: N(r.aseg_valor_mercancia),
        aseg_costo:         N(r.aseg_costo),
        aseg_venta:         N(r.aseg_venta),
      };
    });

    const columns = [
      // PO (generales)
      { key: 'po_id',               label: 'PO ID' },
      { key: 'folio_proceso',       label: 'Folio Proceso' },
      { key: 'cliente',             label: 'Cliente' },
      { key: 'doc_po',              label: 'Documento PO' },
      { key: 'mercancia',           label: 'Mercancía' },
      { key: 'fecha_alta',          label: 'Fecha Alta' },
      { key: 'tipo_importacion',    label: 'Tipo de importación' },
      { key: 'ejecutivo_cuenta',    label: 'Ejecutivo de Cuenta' },
      { key: 'tipo_carga',          label: 'Tipo de Carga' },
      { key: 'valor_mercancia',     label: 'Valor Mercancía' },
      { key: 'etd',                 label: 'ETD' },
      { key: 'observaciones',       label: 'Observaciones' },
      { key: 'estatus',             label: 'Estatus' },
      { key: 'estatus_codigo',      label: 'Estatus Código' },
      { key: 'links_drive',         label: 'Archivos en Drive' },

      // Información de Embarque
      { key: 'hbl',                 label: 'HBL' },
      { key: 'no_contenedor',       label: 'No. Contenedor' },
      { key: 'shipper',             label: 'Shipper' },
      { key: 'icoterm',             label: 'ICOTERM' },
      { key: 'consignatario',       label: 'Consignatario' },
      { key: 'forwarde',            label: 'FORWARDE' },
      { key: 'tipo',                label: 'Tipo' },
      { key: 'peso_bl',             label: 'Peso BL' },
      { key: 'peso_real',           label: 'Peso Real' },
      { key: 'vessel',              label: 'Vessel' },
      { key: 'naviera',             label: 'Naviera' },
      { key: 'pol',                 label: 'POL' },
      { key: 'pais_origen',         label: 'País Origen' },
      { key: 'pod',                 label: 'POD' },
      { key: 'pais_destino',        label: 'País Destino' },

      // Proceso Revalidación
      { key: 'mbl',                 label: 'MBL' },
      { key: 'eta',                 label: 'ETA' },
      { key: 'descarga',            label: 'Descarga' },
      { key: 'terminal',            label: 'Terminal' },
      { key: 'revalidacion',        label: 'Revalidación' },
      { key: 'recepcion_envio_docs',label: 'Recepción/Envío Docs' },

      // Datos Pedimento
      { key: 'pedimento',           label: 'Pedimento' },
      { key: 'pago_pedimento',      label: 'Pago Pedimento' },
      { key: 'regimen',             label: 'Régimen' },
      { key: 'aa_despacho',         label: 'AA Despacho' },
      { key: 'agente_aduanal',      label: 'Agente Aduanal' },

      // Salida / Retorno
      { key: 'salida_aduana',       label: 'Salida Aduana' },
      { key: 'entrega',             label: 'Entrega' },
      { key: 'f_max',               label: 'F. Max' },
      { key: 'entrega_vacio',       label: 'Entrega Vacío' },
      { key: 'condiciones_contenedor', label: 'Condiciones Contenedor' },
      { key: 'terminal_vacio',      label: 'Terminal Vacío' },

      // Asignación (solo generales)
      { key: 'ac_id',               label: 'AC ID' },
      { key: 'ac_cliente_id',       label: 'AC Cliente ID' },
      { key: 'tiene_asignacion',    label: 'Tiene Asignación' },

      // Despacho/Cotización (4)
      { key: 'ac_folio_cotizacion',       label: 'Folio Cotizacion' },
      { key: 'ac_comision_intermediario', label: 'Comisión Intermediario' },
      { key: 'ac_facturacion',            label: 'Facturación' },
      { key: 'ac_comision_socio',         label: 'Comisión Socio' },

      // AA Despacho
      { key: 'aa_giro',                    label: 'Giro' },
      { key: 'aa_proveedor',               label: 'Proveedor' },
      { key: 'aa_servicio1',               label: 'SERVICIO1 - AA' },
      { key: 'aa_costo_importacion',       label: 'costo-importacion' },
      { key: 'aa_venta_importacion',       label: 'venta-importacion' },
      { key: 'aa_servicio2',               label: 'SERVICIO2 - AA' },
      { key: 'aa_costo_almacenajes',       label: 'costo-almacenajes' },
      { key: 'aa_venta_almacenajes',       label: 'venta-almacenajes' },
      { key: 'aa_servicio3',               label: 'SERVICIO3 - AA' },
      { key: 'aa_costo_serv_prg_mo_ejec',  label: 'costo-serv. prg. mo ejec.' },
      { key: 'aa_venta_serv_prg_mo_ejec',  label: 'venta-serv. prg. mo ejec.' },
      { key: 'aa_servicio4',               label: 'SERVICIO4 - AA' },
      { key: 'aa_costo_servicio4',         label: 'costo-servicio4' },
      { key: 'aa_venta_servicio4',         label: 'venta-servicio4' },
      { key: 'aa_servicio5',               label: 'SERVICIO5 - AA' },
      { key: 'aa_costo_servicio5',         label: 'costo-servicio5' },
      { key: 'aa_venta_servicio5',         label: 'venta-servicio5' },

      // Forwarder (base + extra único)
      { key: 'fwd_proveedor',              label: 'FW - Proveedor' },
      { key: 'fwd_quien_pagamos',          label: 'FW - ¿A quién pagamos?' },
      { key: 'fwd_consignatario',          label: 'FW - Consignatario' },
      { key: 'fwd_naviera',                label: 'FW - Naviera' },
      { key: 'fwd_flete_costo',            label: 'FW - Flete Intl (Costo)' },
      { key: 'fwd_flete_venta',            label: 'FW - Flete Intl (Venta)' },
      { key: 'fwd_cargos_costo',           label: 'FW - Cargos Locales (Costo)' },
      { key: 'fwd_cargos_venta',           label: 'FW - Cargos Locales (Venta)' },
      { key: 'fwd_demoras_costo',          label: 'FW - Demoras (Costo)' },
      { key: 'fwd_demoras_venta',          label: 'FW - Demoras (Venta)' },
      { key: 'fwd_extra_servicio',         label: 'FW - Servicio Extra' },
      { key: 'fwd_extra_costo',            label: 'FW - Extra (Costo)' },
      { key: 'fwd_extra_venta',            label: 'FW - Extra (Venta)' },
      { key: 'fwd_abonado',                label: 'FW - Abonado' },
      { key: 'fwd_fecha_abono',            label: 'FW - Fecha Abono' },
      { key: 'fwd_reembolsado',            label: 'FW - Reembolsado' },
      { key: 'fwd_fecha_reembolso',        label: 'FW - Fecha Reembolso' },

      // Flete Terrestre (base)
      { key: 'flete_giro',                 label: 'Giro FT' },
      { key: 'flete_proveedor',            label: 'FT - Proveedor' },
      { key: 'flete_costo',                label: 'FT - Flete (Costo)' },
      { key: 'flete_venta',                label: 'FT - Flete (Venta)' },
      { key: 'flete_estadia_costo',        label: 'FT - Estadia (Costo)' },
      { key: 'flete_estadia_venta',        label: 'FT - Estadia (Venta)' },
      { key: 'flete_burreo_costo',         label: 'FT - Burreo (Costo)' },
      { key: 'flete_burreo_venta',         label: 'FT - Burreo (Venta)' },
      { key: 'flete_sobrepeso_costo',      label: 'FT - Sobrepeso (Costo)' },
      { key: 'flete_sobrepeso_venta',      label: 'FT - Sobrepeso (Venta)' },
      { key: 'flete_apoyo_costo',          label: 'FT - Apoyo (Costo)' },
      { key: 'flete_apoyo_venta',          label: 'FT - Apoyo (Venta)' },
      { key: 'flete_pernocta_costo',       label: 'FT - Pernocta (Costo)' },
      { key: 'flete_pernocta_venta',       label: 'FT - Pernocta (Venta)' },

      // Flete Terrestre (EXTRAS 1..5)
      { key: 'flete_extra1',               label: 'FT - Extra1 (Servicio)' },
      { key: 'flete_extra1_costo',         label: 'FT - Extra1 (Costo)' },
      { key: 'flete_extra1_venta',         label: 'FT - Extra1 (Venta)' },
      { key: 'flete_extra2',               label: 'FT - Extra2 (Servicio)' },
      { key: 'flete_extra2_costo',         label: 'FT - Extra2 (Costo)' },
      { key: 'flete_extra2_venta',         label: 'FT - Extra2 (Venta)' },
      { key: 'flete_extra3',               label: 'FT - Extra3 (Servicio)' },
      { key: 'flete_extra3_costo',         label: 'FT - Extra3 (Costo)' },
      { key: 'flete_extra3_venta',         label: 'FT - Extra3 (Venta)' },
      { key: 'flete_extra4',               label: 'FT - Extra4 (Servicio)' },
      { key: 'flete_extra4_costo',         label: 'FT - Extra4 (Costo)' },
      { key: 'flete_extra4_venta',         label: 'FT - Extra4 (Venta)' },
      { key: 'flete_extra5',               label: 'FT - Extra5 (Servicio)' },
      { key: 'flete_extra5_costo',         label: 'FT - Extra5 (Costo)' },
      { key: 'flete_extra5_venta',         label: 'FT - Extra5 (Venta)' },

            // === Custodia ===
      { key: 'cust_giro',                  label: 'Giro' },
      { key: 'cust_proveedor',             label: 'Proveedor' },

      { key: 'cust_servicio1',             label: 'SERVICIO1 - Custodia' },
      { key: 'cust_costo_custodia',        label: 'costo-custodia' },
      { key: 'cust_venta_custodia',        label: 'venta-custodia' },

      { key: 'cust_servicio2',             label: 'SERVICIO2 - Custodia' },
      { key: 'cust_costo_pernocta',        label: 'costo-pernocta custodia' },
      { key: 'cust_venta_pernocta',        label: 'venta-pernocta custodia' },

      { key: 'cust_servicio3',             label: 'SERVICIO3 - Custodia' },
      { key: 'cust_costo_falso',           label: 'costo-custodia en falso' },
      { key: 'cust_venta_falso',           label: 'venta-custodia en falso' },

      { key: 'cust_servicio4',             label: 'SERVICIO4 - Custodia' },
      { key: 'cust_costo_cancelacion',     label: 'costo-cancelación custodia' },
      { key: 'cust_venta_cancelacion',     label: 'venta-cancelación custodia' },

      { key: 'cust_servicio5',             label: 'SERVICIO5 - Custodia' },
      { key: 'cust_costo_dias',            label: 'costo-días custodia' },
      { key: 'cust_venta_dias',            label: 'venta-días custodia' },

      // === Paquetería ===
      { key: 'paq_giro',           label: 'Giro' },
      { key: 'paq_empresa',        label: 'Paquetería - Empresa' },
      { key: 'paq_costo',          label: 'Paquetería - Costo' },
      { key: 'paq_venta',          label: 'Paquetería - Venta' },

      // === Aseguradora ===
      { key: 'aseg_giro',              label: 'Giro' },
      { key: 'aseg_aseguradora',       label: 'Aseguradora - Nombre' },
      { key: 'aseg_valor_mercancia',   label: 'Aseguradora - Valor Mercancía' },
      { key: 'aseg_costo',             label: 'Aseguradora - Costo' },
      { key: 'aseg_venta',             label: 'Aseguradora - Venta' },

    ];

    const fname = `po_asignacion_generales_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.csv`;
    const csv = toCsv(rows, columns);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fname}"`);
    res.status(200).send(csv);
  } catch (err) {
    console.error('CSV PO+Asignación (generales) error:', err);
    res.status(500).json({ mensaje: 'Error al generar CSV PO+Asignación (generales)', error: err.message });
  }
};
