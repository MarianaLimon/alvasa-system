const db = require('../../config/db');

// 🗓️ Utilidad para formatear fecha
function formatearFecha(fechaISO) {
  if (!fechaISO) return '—';
  const fecha = new Date(fechaISO + 'T00:00:00');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = fecha.toLocaleString('es-MX', { month: 'long' });
  const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);
  const anio = fecha.getFullYear();
  return `${dia} ${mesCapitalizado} ${anio}`;
}

// ✅ Inserta el estado inicial en la tabla estado_pago_proveedor si no existe
async function insertarEstadoInicialPago(numero_control, monto) {
  try {
    const tipo_cambio = 1.0;
    const pesos = monto * tipo_cambio;
    const saldo = pesos;
    const estatus = 'Pendiente';

    await db.promise().query(`
    INSERT IGNORE INTO estado_pago_proveedor 
    (numero_control, monto, tipo_moneda, tipo_cambio, monto_en_pesos, saldo, estatus)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [numero_control, monto, '', tipo_cambio, pesos, saldo, estatus]);

  } catch (error) {
    console.error(`❌ Error al insertar estado inicial para ${numero_control}:`, error);
  }
}

// 🔄 Obtener lista dinámica de pagos desde asignación de costos
exports.obtenerListaPagosProveedores = async (req, res) => {
  try {
    const [procesos] = await db.promise().query(`
      SELECT 
        po.id,
        po.folio_proceso,
        c.nombre AS cliente_nombre,
        ie.no_contenedor,
        sr.entrega
      FROM procesos_operativos po
      LEFT JOIN clientes c ON po.cliente_id = c.id
      LEFT JOIN informacion_embarque ie ON po.id = ie.proceso_operativo_id
      LEFT JOIN salida_retorno_contenedor sr ON po.id = sr.proceso_operativo_id
    `);

    const listaPagos = [];
    let numeroGrupo = 1;
    const procesados = new Set();

    for (const proceso of procesos) {
      const procesoId = proceso.id;
      if (procesados.has(procesoId)) continue;
      procesados.add(procesoId);

      const { entrega, cliente_nombre, no_contenedor } = proceso;
      const fechaFormateada = formatearFecha(entrega);

      const [asignacion] = await db.promise().query(
        `SELECT id FROM asignacion_costos WHERE proceso_operativo_id = ?`,
        [procesoId]
      );
      if (asignacion.length === 0) continue;

      const asignacionId = asignacion[0].id;
      const grupoControl = `PAGO-${String(numeroGrupo).padStart(3, '0')}`;
      let letra = 65; // A

      const agregarPago = (giro, proveedor, concepto, monto) => {
        if (concepto && monto && parseFloat(monto) > 0) {
          const numero_control = `${grupoControl}-${String.fromCharCode(letra++)}`;
          const pago = {
            numero_control,
            fecha: fechaFormateada,
            cliente: cliente_nombre,
            contenedor: no_contenedor,
            giro,
            proveedor,
            concepto,
            monto: parseFloat(monto)
          };
          listaPagos.push(pago);
        }
      };

      // === AA DESPACHO ===
      const [aa] = await db.promise().query(
        `SELECT * FROM aa_despacho_costos WHERE asignacion_id = ?`,
        [asignacionId]
      );
      if (aa.length > 0) {
        const a = aa[0];
        agregarPago('AA Despacho', a.aa_despacho, 'IMPORTACIÓN', a.importacion_costo);
        agregarPago('AA Despacho', a.aa_despacho, 'ALMACENAJES', a.almacenajes_costo);
        agregarPago('AA Despacho', a.aa_despacho, 'SERV. PRG. MO EJEC.', a.servicio_costo);
        agregarPago('AA Despacho', a.aa_despacho, a.tipo_servicio1, a.costo_servicio1);
        agregarPago('AA Despacho', a.aa_despacho, a.tipo_servicio2, a.costo_servicio2);
      }

      // === FORWARDER ===
      const [fwd] = await db.promise().query(
        `SELECT * FROM forwarder_costos WHERE asignacion_id = ?`,
        [asignacionId]
      );
      if (fwd.length > 0) {
        const f = fwd[0];
        const giro = f.asignado_por === 'NAVIERA' ? 'Naviera' : 'Forwarder';
        const proveedor = giro === 'Naviera' ? f.naviera : f.forwarder;

        agregarPago(giro, proveedor, 'FLETE INTERNACIONAL', f.flete_internacional_costo);
        agregarPago(giro, proveedor, 'CARGOS LOCALES', f.cargos_locales_costo);
        agregarPago(giro, proveedor, 'DEMORAS', f.demoras_costo);
        agregarPago(giro, proveedor, f.tipo_servicio_extra, f.costo_servicio_extra);
      }

      // === FLETE TERRESTRE ===
      const [flete] = await db.promise().query(
        `SELECT * FROM flete_terrestre_costos WHERE asignacion_id = ?`,
        [asignacionId]
      );
      if (flete.length > 0) {
        const f = flete[0];
        const proveedor = f.proveedor;

        const campos = [
          { nombre: 'Flete', valor: f.flete },
          { nombre: 'Estadía', valor: f.estadia },
          { nombre: 'Burreo', valor: f.burreo },
          { nombre: 'Sobrepeso', valor: f.sobrepeso },
          { nombre: 'Apoyo', valor: f.apoyo },
          { nombre: 'Pernocta', valor: f.pernocta }
        ];

        campos.forEach(c => agregarPago('Flete Terrestre', proveedor, c.nombre, c.valor));

        const [extras] = await db.promise().query(
          `SELECT * FROM extras_flete_terrestre WHERE flete_terrestre_id = ?`,
          [f.id]
        );
        extras.forEach(extra => {
          agregarPago('Flete Terrestre', proveedor, extra.concepto, extra.costo);
        });
      }

      // === CUSTODIA ===
      const [cust] = await db.promise().query(
        `SELECT * FROM custodia_costos WHERE asignacion_id = ?`,
        [asignacionId]
      );
      if (cust.length > 0) {
        const c = cust[0];
        agregarPago('Custodia', c.custodia_proveedor, 'Servicio Base', c.custodia_costo);
        agregarPago('Custodia', c.custodia_proveedor, 'Pernocta', c.custodia_pernocta_costo);
        agregarPago('Custodia', c.custodia_proveedor, 'Falso', c.custodia_falso_costo);
        agregarPago('Custodia', c.custodia_proveedor, 'Cancelación', c.custodia_cancelacion_costo);
      }

      // === PAQUETERÍA ===
      const [paq] = await db.promise().query(
        `SELECT * FROM paqueteria_costos WHERE asignacion_id = ?`,
        [asignacionId]
      );
      if (paq.length > 0 && parseFloat(paq[0].costo) > 0) {
        agregarPago('Paquetería', paq[0].empresa, 'Servicio de Paquetería', paq[0].costo);
      }

      // === ASEGURADORA ===
      const [aseg] = await db.promise().query(
        `SELECT * FROM aseguradora_costos WHERE asignacion_id = ?`,
        [asignacionId]
      );
      if (aseg.length > 0 && parseFloat(aseg[0].costo) > 0) {
        agregarPago('Aseguradora', aseg[0].aseguradora, 'Póliza de Seguro', aseg[0].costo);
      }

      numeroGrupo++;
    }

    // Insertar estado inicial para cada uno
    for (const pago of listaPagos) {
    // Insertar estado inicial si no existe
    await insertarEstadoInicialPago(pago.numero_control, pago.monto);

    // 🔄 Siempre actualizar el monto base por si cambia
    await db.promise().query(`
      UPDATE estado_pago_proveedor 
      SET monto = ? 
      WHERE numero_control = ?
    `, [pago.monto, pago.numero_control]);

    // 🧾 Si no se ha definido tipo_moneda, establecer valores por defecto
    const [estadoActual] = await db.promise().query(`
      SELECT tipo_moneda FROM estado_pago_proveedor WHERE numero_control = ?
    `, [pago.numero_control]);

    if (!estadoActual[0].tipo_moneda || estadoActual[0].tipo_moneda.trim() === '') {
      const tipoCambio = 1.0;
      const pesos = pago.monto * tipoCambio;
      const saldo = pesos;
      const estatus = 'Pendiente';

      await db.promise().query(`
        UPDATE estado_pago_proveedor 
        SET monto_en_pesos = ?, saldo = ?, estatus = ?
        WHERE numero_control = ?
      `, [pesos, saldo, estatus, pago.numero_control]);
    }

    // 🔁 Recalcular saldo y estatus usando monto_en_pesos actual
    const [estadoPesos] = await db.promise().query(`
      SELECT monto_en_pesos FROM estado_pago_proveedor WHERE numero_control = ?
    `, [pago.numero_control]);

    const pesos = parseFloat(estadoPesos[0]?.monto_en_pesos || pago.monto);

    const [abonos] = await db.promise().query(`
      SELECT COALESCE(SUM(abono), 0) AS total FROM abonos_pagos WHERE numero_control = ?
    `, [pago.numero_control]);

    const totalAbonado = parseFloat(abonos[0].total);
    const saldoRecalculado = pesos - totalAbonado;
    const estatusRecalculado = saldoRecalculado <= 0 ? 'Saldado' : 'Pendiente';

    await db.promise().query(`
      UPDATE estado_pago_proveedor
      SET saldo = ?, estatus = ?
      WHERE numero_control = ?
    `, [saldoRecalculado, estatusRecalculado, pago.numero_control]);

    // 📦 Cargar valores finales del estado para mostrar en frontend
    const [estado] = await db.promise().query(`
      SELECT 
        tipo_moneda,
        tipo_cambio,
        monto_en_pesos,
        saldo,
        estatus
      FROM estado_pago_proveedor
      WHERE numero_control = ?
    `, [pago.numero_control]);

    if (estado.length > 0) {
      const e = estado[0];
      pago.tipo_moneda = e.tipo_moneda || '';
      pago.tipo_cambio = e.tipo_cambio || 1.0;
      pago.pesos = e.monto_en_pesos || pago.monto;
      pago.saldo = e.saldo || pago.monto;
      pago.estatus = e.estatus || 'Pendiente';
    } else {
      // Seguridad por si no encuentra estado
      pago.tipo_moneda = '';
      pago.tipo_cambio = 1.0;
      pago.pesos = pago.monto;
      pago.saldo = pago.monto;
      pago.estatus = 'Pendiente';
    }
  }


    res.json(listaPagos);

  } catch (error) {
    console.error('❌ Error al obtener lista de pagos:', error);
    res.status(500).json({ message: 'Error al generar lista de pagos' });
  }
};

// 🛠️ Actualizar tipo de moneda, tipo de cambio, pesos, saldo y estatus
exports.actualizarEstadoPago = async (req, res) => {
  const { numero_control } = req.params;
  const { tipo_moneda, tipo_cambio } = req.body;

  try {
    // 🚫 Validar datos básicos
    if (!numero_control || tipo_cambio < 0) {
      return res.status(400).json({ message: 'Datos inválidos.' });
    }

    // 🔍 Obtener monto original desde la tabla estado_pago_proveedor
    const [pago] = await db.promise().query(`
    SELECT monto FROM estado_pago_proveedor WHERE numero_control = ?
    `, [numero_control]);

    if (pago.length === 0) {
    return res.status(404).json({ message: 'Número de control no encontrado.' });
    }

    const monto = parseFloat(pago[0].monto);
    const tipoCambio = parseFloat(tipo_cambio) || 0;
    const pesos = tipoCambio > 0 ? monto * tipoCambio : monto;

    // 🔄 Obtener total de abonos registrados
    const [abonos] = await db.promise().query(`
    SELECT COALESCE(SUM(abono), 0) AS total FROM abonos_pagos WHERE numero_control = ?
    `, [numero_control]);

    const totalAbonado = parseFloat(abonos[0].total);
    const saldo = pesos - totalAbonado;

    // ✅ Determinar estatus
    const estatus = saldo <= 0 ? 'Saldado' : 'Pendiente';

    // 💾 Actualizar estado en la tabla correspondiente
    await db.promise().query(`
    UPDATE estado_pago_proveedor 
    SET tipo_moneda = ?, tipo_cambio = ?, monto_en_pesos = ?, saldo = ?, estatus = ?
    WHERE numero_control = ?
    `, [tipo_moneda?.toUpperCase() || '', tipoCambio, pesos, saldo, estatus, numero_control]);


    res.status(200).json({
      message: 'Estado actualizado correctamente.',
      monto_original: monto,
      monto_en_pesos: pesos,
      total_abonado: totalAbonado,
      saldo,
      estatus
    });

  } catch (error) {
    console.error('❌ Error al actualizar estado de pago:', error);
    res.status(500).json({ message: 'Error al actualizar estado de pago' });
  }
};
