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
