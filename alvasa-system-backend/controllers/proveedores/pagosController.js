const db = require('../../config/db');

// Formato de fecha sin perder el día original
function formatearFecha(fechaISO) {
  if (!fechaISO) return '—';
  const fecha = new Date(fechaISO + 'T00:00:00');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = fecha.toLocaleString('es-MX', { month: 'long' });
  const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);
  const anio = fecha.getFullYear();
  return `${dia} ${mesCapitalizado} ${anio}`;
}

exports.obtenerListaPagosProveedores = async (req, res) => {
  try {
    const [procesos] = await db.promise().query(`
      SELECT 
        po.id,
        po.folio_proceso,
        po.cliente_id,
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

      // === AA DESPACHO ===
      const [aa] = await db.promise().query(
        `SELECT * FROM aa_despacho_costos WHERE asignacion_id = ?`,
        [asignacionId]
      );
      if (aa.length > 0) {
        const a = aa[0];
        const servicios = [
          { concepto: 'IMPORTACIÓN', monto: a.importacion_costo },
          { concepto: 'ALMACENAJES', monto: a.almacenajes_costo },
          { concepto: 'SERV. PRG. MO EJEC.', monto: a.servicio_costo },
          { concepto: a.tipo_servicio1, monto: a.costo_servicio1 },
          { concepto: a.tipo_servicio2, monto: a.costo_servicio2 }
        ];

        servicios.forEach(s => {
          if (s.concepto && s.monto && parseFloat(s.monto) > 0) {
            listaPagos.push({
              numero_control: `${grupoControl}-${String.fromCharCode(letra++)}`,
              fecha: fechaFormateada,
              cliente: cliente_nombre,
              contenedor: no_contenedor,
              giro: 'AA Despacho',
              proveedor: a.aa_despacho,
              concepto: s.concepto,
              monto: s.monto
            });
          }
        });
      }

      // === FORWARDER ===
      const [forwarderRows] = await db.promise().query(`
        SELECT 
          forwarder, asignado_por, naviera,
          flete_internacional_costo, cargos_locales_costo, demoras_costo,
          tipo_servicio_extra, costo_servicio_extra
        FROM forwarder_costos
        WHERE asignacion_id = ?`, [asignacionId]);

      if (forwarderRows.length > 0) {
        const f = forwarderRows[0];
        const giro = f.asignado_por === 'NAVIERA' ? 'Naviera' : 'Forwarder';
        const proveedor = giro === 'Naviera' ? f.naviera : f.forwarder;

        const conceptos = [
          { concepto: 'FLETE INTERNACIONAL', monto: f.flete_internacional_costo },
          { concepto: 'CARGOS LOCALES', monto: f.cargos_locales_costo },
          { concepto: 'DEMORAS', monto: f.demoras_costo },
          { concepto: f.tipo_servicio_extra, monto: f.costo_servicio_extra }
        ];

        conceptos.forEach(s => {
          if (s.concepto && s.monto && parseFloat(s.monto) > 0) {
            listaPagos.push({
              numero_control: `${grupoControl}-${String.fromCharCode(letra++)}`,
              fecha: fechaFormateada,
              cliente: cliente_nombre,
              contenedor: no_contenedor,
              giro,
              proveedor,
              concepto: s.concepto,
              monto: s.monto
            });
          }
        });
      }

      // === FLETE TERRESTRE ===
      const [flete] = await db.promise().query(
        `SELECT * FROM flete_terrestre_costos WHERE asignacion_id = ?`,
        [asignacionId]
      );
      if (flete.length > 0) {
        const f = flete[0];

        const servicios = [
          { concepto: 'Flete', monto: f.flete },
          { concepto: 'Estadía', monto: f.estadia },
          { concepto: 'Burreo', monto: f.burreo },
          { concepto: 'Sobrepeso', monto: f.sobrepeso },
          { concepto: 'Apoyo', monto: f.apoyo },
          { concepto: 'Pernocta', monto: f.pernocta }
        ];

        servicios.forEach(s => {
          if (s.monto && parseFloat(s.monto) > 0) {
            listaPagos.push({
              numero_control: `${grupoControl}-${String.fromCharCode(letra++)}`,
              fecha: fechaFormateada,
              cliente: cliente_nombre,
              contenedor: no_contenedor,
              giro: 'Flete Terrestre',
              proveedor: f.proveedor,
              concepto: s.concepto,
              monto: s.monto
            });
          }
        });

        // Extras
        const [extras] = await db.promise().query(
          `SELECT * FROM extras_flete_terrestre WHERE flete_terrestre_id = ?`,
          [f.id]
        );
        extras.forEach(extra => {
          if (extra.concepto && extra.costo && parseFloat(extra.costo) > 0) {
            listaPagos.push({
              numero_control: `${grupoControl}-${String.fromCharCode(letra++)}`,
              fecha: fechaFormateada,
              cliente: cliente_nombre,
              contenedor: no_contenedor,
              giro: 'Flete Terrestre',
              proveedor: f.proveedor,
              concepto: extra.concepto,
              monto: extra.costo
            });
          }
        });
      }

      // === CUSTODIA ===
      const [custodia] = await db.promise().query(
        `SELECT * FROM custodia_costos WHERE asignacion_id = ?`,
        [asignacionId]
      );
      if (custodia.length > 0) {
        const c = custodia[0];
        const servicios = [
          { concepto: 'Servicio Base', monto: c.custodia_costo },
          { concepto: 'Pernocta', monto: c.custodia_pernocta_costo },
          { concepto: 'Falso', monto: c.custodia_falso_costo },
          { concepto: 'Cancelación', monto: c.custodia_cancelacion_costo }
        ];

        servicios.forEach(s => {
          if (s.monto && parseFloat(s.monto) > 0) {
            listaPagos.push({
              numero_control: `${grupoControl}-${String.fromCharCode(letra++)}`,
              fecha: fechaFormateada,
              cliente: cliente_nombre,
              contenedor: no_contenedor,
              giro: 'Custodia',
              proveedor: c.custodia_proveedor,
              concepto: s.concepto,
              monto: s.monto
            });
          }
        });
      }

      // === PAQUETERÍA ===
      const [paq] = await db.promise().query(
        `SELECT * FROM paqueteria_costos WHERE asignacion_id = ?`,
        [asignacionId]
      );
      if (paq.length > 0 && paq[0].costo && parseFloat(paq[0].costo) > 0) {
        listaPagos.push({
          numero_control: `${grupoControl}-${String.fromCharCode(letra++)}`,
          fecha: fechaFormateada,
          cliente: cliente_nombre,
          contenedor: no_contenedor,
          giro: 'Paquetería',
          proveedor: paq[0].empresa,
          concepto: 'Servicio de Paquetería',
          monto: paq[0].costo
        });
      }

      // === ASEGURADORA ===
      const [aseg] = await db.promise().query(
        `SELECT * FROM aseguradora_costos WHERE asignacion_id = ?`,
        [asignacionId]
      );
      if (aseg.length > 0 && aseg[0].costo && parseFloat(aseg[0].costo) > 0) {
        listaPagos.push({
          numero_control: `${grupoControl}-${String.fromCharCode(letra++)}`,
          fecha: fechaFormateada,
          cliente: cliente_nombre,
          contenedor: no_contenedor,
          giro: 'Aseguradora',
          proveedor: aseg[0].aseguradora,
          concepto: 'Póliza de Seguro',
          monto: aseg[0].costo
        });
      }

      numeroGrupo++;
    }

    res.json(listaPagos);
  } catch (error) {
    console.error('Error al obtener lista de pagos:', error);
    res.status(500).json({ message: 'Error al obtener lista de pagos' });
  }
};
