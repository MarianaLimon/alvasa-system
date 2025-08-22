function buildPagosProveedoresUnionSQL() {
  const sql = `
    /* ========= Base del folio ========= */
    WITH base AS (
      SELECT
        ac.id AS asignacion_id,
        ac.folio_proceso,
        ac.ejecutivo_cuenta,
        ac.no_contenedor,
        ac.nombre_cliente AS cliente,
        COALESCE(DATE(s.entrega), DATE(ac.fecha_creacion)) AS fecha_sql
      FROM asignacion_costos ac
      LEFT JOIN procesos_operativos po ON po.id = ac.proceso_operativo_id
      LEFT JOIN salida_retorno_contenedor s ON s.proceso_operativo_id = po.id
    ),

    /* ========= Servicios (todas las fuentes) ========= */
    servicios AS (
      /* AA Despacho */
      SELECT b.*, 'AA Despacho' AS giro, COALESCE(adc.aa_despacho,'SIN PROVEEDOR') AS proveedor,
             'Importación' AS concepto, adc.importacion_costo AS monto_original, 1 AS ord_giro, 1 AS ord_concepto
      FROM aa_despacho_costos adc JOIN base b ON b.asignacion_id=adc.asignacion_id
      WHERE adc.importacion_costo>0
      UNION ALL
      SELECT b.*,'AA Despacho',COALESCE(adc.aa_despacho,'SIN PROVEEDOR'),'ALMACENAJES',adc.almacenajes_costo,1,2
      FROM aa_despacho_costos adc JOIN base b ON b.asignacion_id=adc.asignacion_id
      WHERE adc.almacenajes_costo>0
      UNION ALL
      SELECT b.*,'AA Despacho',COALESCE(adc.aa_despacho,'SIN PROVEEDOR'),'SERV. PRG. MO EJEC.',adc.servicio_costo,1,3
      FROM aa_despacho_costos adc JOIN base b ON b.asignacion_id=adc.asignacion_id
      WHERE adc.servicio_costo>0
      UNION ALL
      SELECT b.*,'AA Despacho',COALESCE(adc.aa_despacho,'SIN PROVEEDOR'),
             adc.tipo_servicio1, adc.costo_servicio1, 1,
             CASE WHEN UPPER(adc.tipo_servicio1)='INBOND' THEN 4
                  WHEN UPPER(adc.tipo_servicio1)='APOYO CITA' THEN 5 ELSE 99 END
      FROM aa_despacho_costos adc JOIN base b ON b.asignacion_id=adc.asignacion_id
      WHERE adc.tipo_servicio1 IS NOT NULL AND adc.tipo_servicio1<>'' AND adc.costo_servicio1>0
      UNION ALL
      SELECT b.*,'AA Despacho',COALESCE(adc.aa_despacho,'SIN PROVEEDOR'),
             adc.tipo_servicio2, adc.costo_servicio2, 1,
             CASE WHEN UPPER(adc.tipo_servicio2)='INBOND' THEN 4
                  WHEN UPPER(adc.tipo_servicio2)='APOYO CITA' THEN 5 ELSE 99 END
      FROM aa_despacho_costos adc JOIN base b ON b.asignacion_id=adc.asignacion_id
      WHERE adc.tipo_servicio2 IS NOT NULL AND adc.tipo_servicio2<>'' AND adc.costo_servicio2>0

      /* Forwarder */
      UNION ALL
      SELECT b.*,'Forwarder',COALESCE(f.forwarder,'SIN PROVEEDOR'),'Cargos Locales',f.cargos_locales_costo,2,2
      FROM forwarder_costos f JOIN base b ON b.asignacion_id=f.asignacion_id
      WHERE f.cargos_locales_costo>0
      UNION ALL
      SELECT b.*,'Forwarder',COALESCE(f.forwarder,'SIN PROVEEDOR'),'Demoras',f.demoras_costo,2,3
      FROM forwarder_costos f JOIN base b ON b.asignacion_id=f.asignacion_id
      WHERE f.demoras_costo>0
      UNION ALL
      SELECT b.*,'Forwarder',COALESCE(f.forwarder,'SIN PROVEEDOR'),'Flete Internacional',f.flete_internacional_costo,2,4
      FROM forwarder_costos f JOIN base b ON b.asignacion_id=f.asignacion_id
      WHERE f.flete_internacional_costo>0
      UNION ALL
      SELECT b.*,'Forwarder',COALESCE(f.forwarder,'SIN PROVEEDOR'),
             f.tipo_servicio_extra, f.costo_servicio_extra, 2,
             CASE WHEN UPPER(f.tipo_servicio_extra)='CANCELACION DE FLETE' THEN 1 ELSE 99 END
      FROM forwarder_costos f JOIN base b ON b.asignacion_id=f.asignacion_id
      WHERE f.tipo_servicio_extra IS NOT NULL AND f.tipo_servicio_extra<>'' AND f.costo_servicio_extra>0

      /* Flete Terrestre */
      UNION ALL SELECT b.*,'Flete Terrestre',COALESCE(ft.proveedor,'SIN PROVEEDOR'),'Flete',ft.flete,3,1
      FROM flete_terrestre_costos ft JOIN base b ON b.asignacion_id=ft.asignacion_id WHERE ft.flete>0
      UNION ALL SELECT b.*,'Flete Terrestre',COALESCE(ft.proveedor,'SIN PROVEEDOR'),'Estadia',ft.estadia,3,2
      FROM flete_terrestre_costos ft JOIN base b ON b.asignacion_id=ft.asignacion_id WHERE ft.estadia>0
      UNION ALL SELECT b.*,'Flete Terrestre',COALESCE(ft.proveedor,'SIN PROVEEDOR'),'Burreo',ft.burreo,3,3
      FROM flete_terrestre_costos ft JOIN base b ON b.asignacion_id=ft.asignacion_id WHERE ft.burreo>0
      UNION ALL SELECT b.*,'Flete Terrestre',COALESCE(ft.proveedor,'SIN PROVEEDOR'),'Pernocta',ft.pernocta,3,4
      FROM flete_terrestre_costos ft JOIN base b ON b.asignacion_id=ft.asignacion_id WHERE ft.pernocta>0
      UNION ALL SELECT b.*,'Flete Terrestre',COALESCE(ft.proveedor,'SIN PROVEEDOR'),'Apoyo',ft.apoyo,3,5
      FROM flete_terrestre_costos ft JOIN base b ON b.asignacion_id=ft.asignacion_id WHERE ft.apoyo>0
      UNION ALL SELECT b.*,'Flete Terrestre',COALESCE(ft.proveedor,'SIN PROVEEDOR'),'Sobrepeso',ft.sobrepeso,3,6
      FROM flete_terrestre_costos ft JOIN base b ON b.asignacion_id=ft.asignacion_id WHERE ft.sobrepeso>0
      UNION ALL
      SELECT b.*,'Flete Terrestre',COALESCE(ft.proveedor,'SIN PROVEEDOR'),e.concepto,e.costo,3,99
      FROM flete_terrestre_costos ft
      JOIN extras_flete_terrestre e ON e.flete_terrestre_id=ft.id
      JOIN base b ON b.asignacion_id=ft.asignacion_id
      WHERE e.costo>0

      /* Custodia / Paquetería / Aseguradora */
      UNION ALL SELECT b.*,'Custodia',COALESCE(c.custodia_proveedor,'SIN PROVEEDOR'),'Custodia',c.custodia_costo,4,1
      FROM custodia_costos c JOIN base b ON b.asignacion_id=c.asignacion_id WHERE c.custodia_costo>0
      UNION ALL SELECT b.*,'Custodia',COALESCE(c.custodia_proveedor,'SIN PROVEEDOR'),'Pernocta de Custodia',c.custodia_pernocta_costo,4,2
      FROM custodia_costos c JOIN base b ON b.asignacion_id=c.asignacion_id WHERE c.custodia_pernocta_costo>0
      UNION ALL SELECT b.*,'Custodia',COALESCE(c.custodia_proveedor,'SIN PROVEEDOR'),'Custodia en Falso',c.custodia_falso_costo,4,3
      FROM custodia_costos c JOIN base b ON b.asignacion_id=c.asignacion_id WHERE c.custodia_falso_costo>0
      UNION ALL SELECT b.*,'Custodia',COALESCE(c.custodia_proveedor,'SIN PROVEEDOR'),'Cancelación de Custodia',c.custodia_cancelacion_costo,4,4
      FROM custodia_costos c JOIN base b ON b.asignacion_id=c.asignacion_id WHERE c.custodia_cancelacion_costo>0
      UNION ALL SELECT b.*,'Custodia',COALESCE(c.custodia_proveedor,'SIN PROVEEDOR'),'Almacenaje de Custodia',c.custodia_costo_almacenaje,4,5
      FROM custodia_costos c JOIN base b ON b.asignacion_id=c.asignacion_id WHERE c.custodia_costo_almacenaje>0

      UNION ALL SELECT b.*,'Paquetería',COALESCE(p.empresa,'SIN PROVEEDOR'),'Paquetería',p.costo,5,1
      FROM paqueteria_costos p JOIN base b ON b.asignacion_id=p.asignacion_id WHERE p.costo>0

      UNION ALL SELECT b.*,'Aseguradora',COALESCE(a.aseguradora,'SIN PROVEEDOR'),'Seguro de mercancía',a.costo,6,1
      FROM aseguradora_costos a JOIN base b ON b.asignacion_id=a.asignacion_id WHERE a.costo>0
    ),

    /* ========= Numeración por servicio dentro del folio ========= */
    srv AS (
      SELECT s.*,
             ROW_NUMBER() OVER (
               PARTITION BY s.folio_proceso
               ORDER BY s.ord_giro, s.proveedor, s.ord_concepto, s.concepto
             ) AS rn
      FROM servicios s
    ),

    /* ========= Pago exacto por folio+orden y fallback último por folio ========= */
    e_match AS (
      SELECT folio_proceso, orden, numero_control, tipo_moneda, tipo_cambio, monto, saldo, estatus
      FROM estado_pago_proveedor
    ),
    e_last AS (
      SELECT e1.*
      FROM estado_pago_proveedor e1
      JOIN (
        SELECT folio_proceso, MAX(id) AS max_id
        FROM estado_pago_proveedor
        GROUP BY folio_proceso
      ) m ON m.folio_proceso = e1.folio_proceso AND m.max_id = e1.id
    )

    /* ========= SELECT final (1 fila por ABONO) ========= */
    SELECT
      sr.folio_proceso                                   AS no_control,
      sr.ejecutivo_cuenta                                AS ejecutivo,
      DATE_FORMAT(sr.fecha_sql,'%d/%m/%Y')               AS fecha,
      sr.cliente                                         AS cliente,
      sr.no_contenedor                                   AS no_contenedor,
      sr.giro                                            AS giro,
      sr.proveedor                                       AS proveedor,
      sr.concepto                                        AS concepto,
      sr.monto_original                                  AS monto_original,

      /* Moneda y TC para convertir el servicio (según el pago ligado) */
      CASE
        WHEN UPPER(CAST(COALESCE(em.tipo_moneda, el.tipo_moneda) AS CHAR)) IN ('USD','EUR','MXN')
          THEN UPPER(CAST(COALESCE(em.tipo_moneda, el.tipo_moneda) AS CHAR))
        WHEN CAST(COALESCE(em.tipo_moneda, el.tipo_moneda) AS DECIMAL(12,6)) = 1
          THEN 'MXN'
        ELSE 'MXN'
      END                                                AS moneda,
      CASE
        WHEN (
          CASE
            WHEN UPPER(CAST(COALESCE(em.tipo_moneda, el.tipo_moneda) AS CHAR)) IN ('USD','EUR','MXN')
              THEN UPPER(CAST(COALESCE(em.tipo_moneda, el.tipo_moneda) AS CHAR))
            WHEN CAST(COALESCE(em.tipo_moneda, el.tipo_moneda) AS DECIMAL(12,6)) = 1
              THEN 'MXN'
            ELSE 'MXN'
          END
        ) = 'MXN'
          THEN 1
        ELSE COALESCE(
               CAST(NULLIF(NULLIF(TRIM(COALESCE(em.tipo_cambio, el.tipo_cambio)),''),'0') AS DECIMAL(12,6)),
               1
             )
      END                                                AS tipo_cambio,

      ROUND(
        sr.monto_original *
        CASE
          WHEN (
            CASE
              WHEN UPPER(CAST(COALESCE(em.tipo_moneda, el.tipo_moneda) AS CHAR)) IN ('USD','EUR','MXN')
                THEN UPPER(CAST(COALESCE(em.tipo_moneda, el.tipo_moneda) AS CHAR))
              WHEN CAST(COALESCE(em.tipo_moneda, el.tipo_moneda) AS DECIMAL(12,6)) = 1
                THEN 'MXN'
              ELSE 'MXN'
            END
          ) = 'MXN' THEN 1
          ELSE COALESCE(
                 CAST(NULLIF(NULLIF(TRIM(COALESCE(em.tipo_cambio, el.tipo_cambio)),''),'0') AS DECIMAL(12,6)),
                 1
               )
        END
      , 2)                                               AS monto_en_pesos,

      /* ===== Datos del pago (exacto o fallback) ===== */
      COALESCE(em.numero_control, el.numero_control)     AS pago_numero_control,
      COALESCE(em.orden,          el.orden)              AS pago_orden,
      COALESCE(em.monto,          el.monto)              AS pago_monto,
      COALESCE(em.saldo,          el.saldo)              AS pago_saldo,
      COALESCE(em.estatus,        el.estatus)            AS pago_estatus,

      /* ===== Abonos: 1 fila por abono (LEFT para que sin abonos salga 1 fila null) ===== */
      ab.abono                                           AS abono_monto,
      DATE_FORMAT(ab.fecha_pago,'%d/%m/%Y')              AS abono_fecha_pago,
      ab.tipo_transaccion                                AS abono_tipo_transaccion,

      /* ===== Totales por control general ===== */
      pt.monto_total_en_pesos,
      pt.total_abonado,
      pt.saldo_total,
      pt.estatus_general

    FROM srv sr
    /* pago exacto: folio + orden(rn) */
    LEFT JOIN e_match em
      ON em.folio_proceso = sr.folio_proceso
     AND em.orden = sr.rn
    /* fallback: último pago por folio */
    LEFT JOIN e_last el
      ON el.folio_proceso = sr.folio_proceso
    /* TODOS los abonos del pago (duplica filas por cada abono) */
    LEFT JOIN abonos_pagos ab
      ON ab.numero_control = COALESCE(em.numero_control, el.numero_control)
    /* totales por control general (PAGO-00X) */
    LEFT JOIN proveedores_pagos_totales pt
      ON pt.numero_control_general = SUBSTRING_INDEX(COALESCE(em.numero_control, el.numero_control),'-',2)

    ORDER BY
      sr.folio_proceso,
      sr.ord_giro, sr.proveedor, sr.ord_concepto, sr.concepto,
      COALESCE(em.numero_control, el.numero_control),
      ab.fecha_pago, ab.id;
  `;
  return { sql };
}
module.exports = { buildPagosProveedoresUnionSQL };
