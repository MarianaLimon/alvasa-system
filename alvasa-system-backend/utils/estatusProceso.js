const db = require('../config/db');

// --- Helpers de fecha/presencia ---
function ymd(d) {
  if (!d) return null;
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return null;
  const yyyy = t.getFullYear();
  const mm = String(t.getMonth() + 1).padStart(2, '0');
  const dd = String(t.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function isPresent(v) {
  if (v === null || v === undefined) return false;
  const s = String(v).trim();
  if (!s) return false;
  const f = new Date(v);
  return Number.isNaN(f.getTime()) ? true : !!ymd(v); // si es fecha, debe ser válida
}

/**
 * Calcula estatus secuencial según tu Excel y lo guarda en procesos_operativos.
 * Devuelve { code, name }.
 * Secuencia:
 * 1 En espera (po.fecha_alta)
 * 2 Salida origen (po.etd || po.edt)
 * 3 Cont. ETA (pr.eta)
 * 4 Doc. Completos (pr.recepcion_envio_docs)
 * 5 Revalidado (pr.revalidacion)
 * 6 Descargado (pr.descarga)
 * 7 Pedimento (dp.pago_pedimento)
 * 8 Cita / Salida Aduana (sr.salida_aduana > hoy ? Cita : Salida Aduana)
 * 9 Entregado Cliente (sr.entrega)
 * 10 Entregado Vacio (sr.entrega_vacio)
 */
async function calcularEstatusYGuardar(procesoId) {
  const [rows] = await db.promise().query(`
    SELECT
        po.fecha_alta, po.etd,
        pr.eta, pr.recepcion_envio_docs, pr.revalidacion, pr.descarga,
        dp.pago_pedimento,
        sr.salida_aduana, sr.entrega, sr.entrega_vacio
        FROM procesos_operativos po
        LEFT JOIN proceso_revalidacion pr      ON pr.proceso_operativo_id = po.id
        LEFT JOIN datos_pedimento dp           ON dp.proceso_operativo_id = po.id
        LEFT JOIN salida_retorno_contenedor sr ON sr.proceso_operativo_id = po.id
        WHERE po.id = ?
  `, [procesoId]);

  if (!rows?.length) return { code: 0, name: 'Captura inicial' };

  const r = rows[0];
  const hoy = ymd(new Date());
  let code = 0, name = 'Captura inicial';

  // 1
  if (!isPresent(r.fecha_alta)) return await guardar(procesoId, code, name);
  code = 1; name = 'En espera';

  // 2
  const salidaOrigen = r.etd;
  if (!isPresent(salidaOrigen)) return await guardar(procesoId, code, name);
  code = 2; name = 'Salida origen';

  // 3
  if (!isPresent(r.eta)) return await guardar(procesoId, code, name);
  code = 3; name = 'Cont. ETA';

  // 4
  if (!isPresent(r.recepcion_envio_docs)) return await guardar(procesoId, code, name);
  code = 4; name = 'Doc. Completos';

  // 5
  if (!isPresent(r.revalidacion)) return await guardar(procesoId, code, name);
  code = 5; name = 'Revalidado';

  // 6
  if (!isPresent(r.descarga)) return await guardar(procesoId, code, name);
  code = 6; name = 'Descargado';

  // 7
  if (!isPresent(r.pago_pedimento)) return await guardar(procesoId, code, name);
  code = 7; name = 'Pedimento';

  // 8 (regla Cita/Salida Aduana)
  if (!isPresent(r.salida_aduana)) return await guardar(procesoId, code, name);
  const salidaAduana = ymd(r.salida_aduana);
  if (salidaAduana && salidaAduana > hoy) { code = 8; name = 'Cita'; }
  else { code = 8; name = 'Salida Aduana'; }

  // 9
  if (!isPresent(r.entrega)) return await guardar(procesoId, code, name);
  code = 9; name = 'Entregado Cliente';

  // 10
  if (isPresent(r.entrega_vacio)) { code = 10; name = 'Entregado Vacio'; }

  return await guardar(procesoId, code, name);
}

async function guardar(id, code, name) {
  await db.promise().query(
    'UPDATE procesos_operativos SET estatus = ?, estatus_codigo = ?, estatus_actualizado = NOW() WHERE id = ?',
    [name, code, id]
  );
  return { code, name };
}

module.exports = { calcularEstatusYGuardar };
