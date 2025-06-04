const db = require('../../config/db');

exports.guardarForwarder = (req, res) => {
  const asignacionId = req.params.asignacionId;

  const {
    forwarder, asignadoPor, consignatario, naviera,
    fleteInternacionalCosto, fleteInternacionalVenta,
    cargosLocalesCosto, cargosLocalesVenta,
    demorasCosto, demorasVenta,
    abonado, fechaAbon, rembolsado, fechaRemb
  } = req.body;

  const sqlVerificar = 'SELECT id FROM forwarder_costos WHERE asignacion_id = ? LIMIT 1';

  db.query(sqlVerificar, [asignacionId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al verificar forwarder' });

    const valores = [
      forwarder, asignadoPor, consignatario, naviera,
      fleteInternacionalCosto, fleteInternacionalVenta,
      cargosLocalesCosto, cargosLocalesVenta,
      demorasCosto, demorasVenta,
      abonado, fechaAbon, rembolsado, fechaRemb,
      asignacionId
    ];

    if (rows.length > 0) {
        console.log('🔄 Actualizando forwarder con:', valores);
      const sqlUpdate = `
        UPDATE forwarder_costos SET
          forwarder = ?, asignado_por = ?, consignatario = ?, naviera = ?,
          flete_internacional_costo = ?, flete_internacional_venta = ?,
          cargos_locales_costo = ?, cargos_locales_venta = ?,
          demoras_costo = ?, demoras_venta = ?,
          abonado = ?, fecha_abon = ?, rembolsado = ?, fecha_remb = ?
        WHERE asignacion_id = ?
      `;
      db.query(sqlUpdate, valores, (err) => {
        if (err) return res.status(500).json({ error: 'Error al actualizar forwarder' });
        res.json({ message: 'Forwarder actualizado correctamente' });
      });
    } else {
        console.log('🆕 Insertando forwarder con:', valores);
      const sqlInsert = `
        INSERT INTO forwarder_costos (
          forwarder, asignado_por, consignatario, naviera,
          flete_internacional_costo, flete_internacional_venta,
          cargos_locales_costo, cargos_locales_venta,
          demoras_costo, demoras_venta,
          abonado, fecha_abon, rembolsado, fecha_remb,
          asignacion_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(sqlInsert, valores, (err) => {
        if (err) return res.status(500).json({ error: 'Error al guardar forwarder' });
        res.json({ message: 'Forwarder guardado correctamente' });
      });
    }
  });
};

exports.obtenerForwarder = (req, res) => {
  const { asignacionId } = req.params;
  const sql = 'SELECT * FROM forwarder_costos WHERE asignacion_id = ?';

  db.query(sql, [asignacionId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener forwarder' });
    res.json(rows[0] || {});
  });
};