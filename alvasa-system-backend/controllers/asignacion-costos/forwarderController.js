const db = require('../../config/db');
const { insertarOCrearEstadoCuenta } = require('../clientesEC/estadoCuentaClientesController');
const { sincronizarServiciosEstadoCuenta } = require('../../utils/sincronizarServiciosEstadoCuenta');

exports.guardarForwarder = (req, res) => {
  const asignacionId = req.params.asignacionId;

  const {
    forwarder, asignadoPor, consignatario, naviera,
    fleteInternacionalCosto, fleteInternacionalVenta,
    cargosLocalesCosto, cargosLocalesVenta,
    demorasCosto, demorasVenta,
    tipoServicioExtra, costoServicioExtra, ventaServicioExtra,
    abonado, fechaAbon, rembolsado, fechaRemb
  } = req.body;

  const tipoServicioExtraLimpio = tipoServicioExtra?.trim() || null;
  const costoServicioExtraLimpio = parseFloat(costoServicioExtra) || 0;
  const ventaServicioExtraLimpio = parseFloat(ventaServicioExtra) || 0;

  const valores = [
    forwarder || '',
    asignadoPor || '',
    consignatario || '',
    naviera || '',
    parseFloat(fleteInternacionalCosto) || 0,
    parseFloat(fleteInternacionalVenta) || 0,
    parseFloat(cargosLocalesCosto) || 0,
    parseFloat(cargosLocalesVenta) || 0,
    parseFloat(demorasCosto) || 0,
    parseFloat(demorasVenta) || 0,
    tipoServicioExtraLimpio,
    costoServicioExtraLimpio,
    ventaServicioExtraLimpio,
    parseFloat(abonado) || 0,
    fechaAbon || null,
    parseFloat(rembolsado) || 0,
    fechaRemb || null,
    asignacionId
  ];

  const sqlVerificar = 'SELECT id FROM forwarder_costos WHERE asignacion_id = ? LIMIT 1';

  db.query(sqlVerificar, [asignacionId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al verificar forwarder' });

    const callbackFinal = async () => {
      try {
        // Obtener proceso operativo relacionado
        const [[proceso]] = await db.promise().query(
          'SELECT proceso_operativo_id FROM asignacion_costos WHERE id = ?',
          [asignacionId]
        );

        if (!proceso?.proceso_operativo_id) {
          console.warn('⚠️ No se encontró proceso operativo para esta asignación');
          return;
        }

        const procesoId = proceso.proceso_operativo_id;

        // Crear o actualizar estado de cuenta
        await insertarOCrearEstadoCuenta(asignacionId, procesoId);

        // Ejecutar sincronización global
        await sincronizarServiciosEstadoCuenta(asignacionId, procesoId);
      } catch (e) {
        console.error('❌ Error al sincronizar servicios desde Forwarder:', e);
      }
    };

    // INSERT o UPDATE
    if (rows.length > 0) {
      const sqlUpdate = `
        UPDATE forwarder_costos SET
          forwarder = ?, asignado_por = ?, consignatario = ?, naviera = ?,
          flete_internacional_costo = ?, flete_internacional_venta = ?,
          cargos_locales_costo = ?, cargos_locales_venta = ?,
          demoras_costo = ?, demoras_venta = ?,
          tipo_servicio_extra = ?, costo_servicio_extra = ?, venta_servicio_extra = ?,
          abonado = ?, fecha_abon = ?, rembolsado = ?, fecha_remb = ?
        WHERE asignacion_id = ?
      `;
      db.query(sqlUpdate, valores, async (err) => {
        if (err) return res.status(500).json({ error: 'Error al actualizar forwarder' });
        await callbackFinal();
        res.json({ message: 'Forwarder actualizado correctamente' });
      });
    } else {
      const sqlInsert = `
        INSERT INTO forwarder_costos (
          forwarder, asignado_por, consignatario, naviera,
          flete_internacional_costo, flete_internacional_venta,
          cargos_locales_costo, cargos_locales_venta,
          demoras_costo, demoras_venta,
          tipo_servicio_extra, costo_servicio_extra, venta_servicio_extra,
          abonado, fecha_abon, rembolsado, fecha_remb,
          asignacion_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(sqlInsert, valores, async (err) => {
        if (err) return res.status(500).json({ error: 'Error al guardar forwarder' });
        await callbackFinal();
        res.json({ message: 'Forwarder guardado correctamente' });
      });
    }
  });
};

exports.obtenerForwarder = (req, res) => {
  const { asignacionId } = req.params;
  const sql = `
    SELECT
      id, forwarder, asignado_por AS asignadoPor, consignatario, naviera,
      flete_internacional_costo AS fleteInternacionalCosto,
      flete_internacional_venta AS fleteInternacionalVenta,
      cargos_locales_costo AS cargosLocalesCosto,
      cargos_locales_venta AS cargosLocalesVenta,
      demoras_costo AS demorasCosto,
      demoras_venta AS demorasVenta,
      tipo_servicio_extra AS tipoServicioExtra,
      costo_servicio_extra AS costoServicioExtra,
      venta_servicio_extra AS ventaServicioExtra,
      abonado, fecha_abon AS fechaAbon, rembolsado, fecha_remb AS fechaRemb
    FROM forwarder_costos
    WHERE asignacion_id = ?
  `;

  db.query(sql, [asignacionId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener forwarder' });
    res.json(rows[0] || {});
  });
};
