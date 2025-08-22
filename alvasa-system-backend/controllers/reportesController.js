const db = require('../config/db');
const { toCsv } = require('../utils/toCsv');
const {
  buildPagosProveedoresUnionSQL,
  buildPagosProveedoresUnionSQLLegacy,
} = require('../utils/proveedoresUnion');


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
        ON s.id_estado_cuenta = ec.id_estado_cuenta      -- FK por folio EC-000X
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
    res.setHeader('Content-Disposition', 'attachment; filename="cobros_data_servicios.csv"');
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

        COALESCE(a.abono, 0)                AS cantidad_abonada,   -- 0 si no hay abono
        a.fecha_pago                        AS fecha_de_abono,      -- queda vacío si no hay abono
        a.tipo_transaccion                  AS tipo_de_transaccion, -- queda vacío si no hay abono

        ec.abonado                          AS total_de_abonos,
        ec.saldo                            AS saldo,
        ec.estatus                          AS estatus
      FROM estado_cuenta_clientes ec
      LEFT JOIN abonos_estado_cuenta a
        ON a.id_estado_cuenta = ec.id_estado_cuenta  -- LEFT para incluir EC sin abonos
      ORDER BY
        ec.id_estado_cuenta ASC,            -- agrupa por EC (folio)
        (a.fecha_pago IS NULL) ASC,         -- primero los que SÍ tienen fecha
        DATE(a.fecha_pago) ASC,             -- cronológico
        a.id ASC                            -- estable dentro del mismo día
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
    res.setHeader('Content-Disposition', 'attachment; filename="cobros_data_pagos.csv"');
    res.send(csv);
  } catch (err) {
    console.error('CSV cobros pagos error:', err);
    res.status(500).json({ msg: 'Error al generar CSV (pagos)' });
  }
};

// === CSV: Operaciones y cargos extra (stub inicial) ===
exports.csvOperacionesCargosExtra = async (req, res) => {
  try {
    // TODO: definir columnas reales cuando me pases el mapeo.
    const rows = [];
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
    res.setHeader('Content-Disposition', 'attachment; filename="operaciones_cargos_extra.csv"');
    res.send(csv);
  } catch (err) {
    console.error('CSV operaciones stub error:', err);
    res.status(500).json({ msg: 'Error al generar CSV (operaciones)' });
  }
};

exports.csvPagosProveedores = async (req, res) => {
  try {
    const { sql } = buildPagosProveedoresUnionSQL(); // ← versión que genera 1 fila por abono
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
      { key: 'monto_original',  label: 'Monto Original' },
      { key: 'moneda',          label: 'Moneda' },
      { key: 'tipo_cambio',     label: 'Tipo de Cambio' },
      { key: 'monto_en_pesos',  label: 'Monto en Pesos' },

      // Pago asociado (match folio+orden / fallback último por folio)
      { key: 'pago_numero_control', label: 'Pago - Número Control' },
      { key: 'pago_orden',          label: 'Pago - Orden' },
      { key: 'pago_monto',          label: 'Pago - Monto' },
      { key: 'pago_saldo',          label: 'Pago - Saldo' },
      { key: 'pago_estatus',        label: 'Pago - Estatus' },

      // Abonos (1 fila por abono)
      { key: 'abono_monto',            label: 'Abono Monto' },
      { key: 'abono_fecha_pago',       label: 'Abono - Fecha de Pago' },
      { key: 'abono_tipo_transaccion', label: 'Abono - Tipo de Transacción' },

      // Totales por control general (PAGO-00X)
      { key: 'monto_total_en_pesos',  label: 'Monto Total en Pesos' },
      { key: 'total_abonado',         label: 'Total Abonado' },
      { key: 'saldo_total',           label: 'Saldo Total' },
      { key: 'estatus_general',       label: 'Estatus General' },
    ];

    const csv = toCsv(rows ?? [], columns);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="pagos_proveedores.csv"');
    res.status(200).send(csv);
  } catch (err) {
    console.error('CSV pagos proveedores error:', err);
    res.status(500).json({ error: 'Error generando CSV' });
  }
};
