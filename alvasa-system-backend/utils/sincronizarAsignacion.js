const db = require('../config/db');

// 🔄 Sincroniza el campo aa_despacho de la asignación vinculada
const sincronizarAADespacho = (procesoId, nuevoProveedor) => {
  return new Promise((resolve, reject) => {
    const obtenerAsignacionId = `
      SELECT id FROM asignacion_costos WHERE proceso_operativo_id = ? LIMIT 1
    `;

    db.query(obtenerAsignacionId, [procesoId], (errSel, filasSel) => {
      if (errSel || filasSel.length === 0) {
        console.warn('⚠️ No se encontró asignación para el proceso:', procesoId);
        return resolve('No hay asignación vinculada');
      }

      const asignacionId = filasSel[0].id;

      const verificarExistencia = `
        SELECT 1 FROM aa_despacho_costos WHERE asignacion_id = ? LIMIT 1
      `;

      db.query(verificarExistencia, [asignacionId], (errCheck, filasCheck) => {
        if (errCheck) return reject(errCheck);

        if (filasCheck.length > 0) {
          const sqlUpdate = `
            UPDATE aa_despacho_costos
            SET aa_despacho = ?
            WHERE asignacion_id = ?
          `;
          db.query(sqlUpdate, [nuevoProveedor, asignacionId], (errUpd) => {
            if (errUpd) return reject(errUpd);
            resolve('Proveedor actualizado');
          });
        } else {
          const sqlInsert = `
            INSERT INTO aa_despacho_costos (
              asignacion_id, aa_despacho,
              importacion_costo, importacion_venta,
              almacenajes_costo, almacenajes_venta,
              servicio_costo, servicio_venta,
              tipo_servicio1, costo_servicio1, venta_servicio1,
              tipo_servicio2, costo_servicio2, venta_servicio2
            ) VALUES (?, ?, 0,0, 0,0, 0,0, '',0,0, '',0,0)
          `;
          db.query(sqlInsert, [asignacionId, nuevoProveedor], (errInsert) => {
            if (errInsert) return reject(errInsert);
            resolve('Registro de AA Despacho creado');
          });
        }
      });
    });
  });
};

// 🔄 Sincroniza datos de Forwarder si hay asignación vinculada
const sincronizarForwarder = (procesoId, datos) => {
  return new Promise((resolve, reject) => {
    const obtenerAsignacionId = `
      SELECT id FROM asignacion_costos WHERE proceso_operativo_id = ? LIMIT 1
    `;

    db.query(obtenerAsignacionId, [procesoId], (errSel, filasSel) => {
      if (errSel || filasSel.length === 0) {
        console.warn('⚠️ No se encontró asignación para el proceso (forwarder):', procesoId);
        return resolve('No hay asignación vinculada');
      }

      const asignacionId = filasSel[0].id;
      const forwarder = datos.informacion_embarque?.forwarde || '';
      const consignatario = datos.informacion_embarque?.consignatario || '';
      const naviera = datos.informacion_embarque?.naviera || '';

      const verificarExistencia = `
        SELECT 1 FROM forwarder_costos WHERE asignacion_id = ? LIMIT 1
      `;

      db.query(verificarExistencia, [asignacionId], (errCheck, filasCheck) => {
        if (errCheck) return reject(errCheck);

        if (filasCheck.length > 0) {
          const sqlUpdate = `
            UPDATE forwarder_costos
            SET forwarder = ?, consignatario = ?, naviera = ?
            WHERE asignacion_id = ?
          `;
          db.query(sqlUpdate, [forwarder, consignatario, naviera, asignacionId], (errUpd) => {
            if (errUpd) return reject(errUpd);
            resolve('Forwarder actualizado');
          });
        } else {
          const sqlInsert = `
            INSERT INTO forwarder_costos (
              asignacion_id, forwarder, consignatario, naviera,
              flete_internacional_costo, flete_internacional_venta,
              cargos_locales_costo, cargos_locales_venta,
              demoras_costo, demoras_venta,
              abonado, fecha_abon, rembolsado, fecha_remb
            ) VALUES (?, ?, ?, ?, 0,0, 0,0, 0,0, 0, NULL, 0, NULL)
          `;
          db.query(sqlInsert, [asignacionId, forwarder, consignatario, naviera], (errInsert) => {
            if (errInsert) return reject(errInsert);
            resolve('Registro de Forwarder creado');
          });
        }
      });
    });
  });
};

module.exports = {
  sincronizarAADespacho,
  sincronizarForwarder
};