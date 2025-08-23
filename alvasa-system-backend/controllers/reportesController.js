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
        ac.cliente_id   AS ac_cliente_id
      FROM procesos_operativos po
      LEFT JOIN clientes c                 ON c.id = po.cliente_id
      LEFT JOIN informacion_embarque ie    ON ie.proceso_operativo_id = po.id
      LEFT JOIN proceso_revalidacion pr    ON pr.proceso_operativo_id = po.id
      LEFT JOIN datos_pedimento dp         ON dp.proceso_operativo_id = po.id
      LEFT JOIN salida_retorno_contenedor sr ON sr.proceso_operativo_id = po.id
      LEFT JOIN asignacion_costos ac       ON ac.proceso_operativo_id = po.id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY po.id ASC
    `;

    const [rowsRaw] = await db.promise().query(sql, params);

    const rows = (rowsRaw || []).map(r => {
      const links = r.links_drive
        ? String(r.links_drive).split('\n').map(s => s.trim()).filter(Boolean).join(' | ')
        : '';

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

        // ===== Asignación (solo generales, sin duplicar)
        ac_id: r.ac_id || '',
        ac_cliente_id: r.ac_cliente_id || '',
        tiene_asignacion: r.ac_id ? 1 : 0
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

      // Asignación (solo generales, sin duplicados)
      { key: 'ac_id',               label: 'AC ID' },
      { key: 'ac_cliente_id',       label: 'AC Cliente ID' },
      { key: 'tiene_asignacion',    label: 'Tiene Asignación' },
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

// Alias por si más adelante usas el otro nombre
exports.csvPOyAsignacionGenerales = exports.csvProcesosAsignacionDetalle;
