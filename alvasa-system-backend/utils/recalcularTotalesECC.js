const db = require('../config/db');

/**
 * Recalcula total (servicios), abonado, saldo y estatus de un ECC.
 * Acepta:
 *   - { idEstadoCuenta: 'EC-0006' }   -> por folio
 *   - { procesoId: 123 }              -> por id_proceso_operativo
 */
exports.recalcularTotalesECC = async ({ idEstadoCuenta, procesoId }) => {
  const conn = db.promise();

  // 1) Resolver ECC (folio y numérico)
  let ecc = null;

  if (idEstadoCuenta) {
    const [rows] = await conn.query(
      `SELECT id, id_estado_cuenta
         FROM estado_cuenta_clientes
        WHERE id_estado_cuenta = ?
        LIMIT 1`,
      [idEstadoCuenta]
    );
    ecc = rows[0];
  } else if (procesoId) {
    const [rows] = await conn.query(
      `SELECT id, id_estado_cuenta
         FROM estado_cuenta_clientes
        WHERE id_proceso_operativo = ?
        ORDER BY id DESC
        LIMIT 1`,
      [procesoId]
    );
    ecc = rows[0];
  }

  if (!ecc) return null; // nada que recalcular

  const eccId = ecc.id;                   // numérico interno
  const eccFolio = ecc.id_estado_cuenta;  // 'EC-0006'

  // 2) Total de servicios (por ID numérico)
  const [[serv]] = await conn.query(
    `SELECT COALESCE(SUM(importe),0) AS total_servicios
       FROM servicios_estado_cuenta
      WHERE id_estado_cuenta = ?`,
    [eccId]
  );
  const totalServicios = Number(serv.total_servicios || 0);

  // 3) Total de abonos (por folio)
  const [[abo]] = await conn.query(
    `SELECT COALESCE(SUM(abono),0) AS total_abonos
       FROM abonos_estado_cuenta
      WHERE id_estado_cuenta = ?`,
    [eccFolio]
  );
  const totalAbonos = Number(abo.total_abonos || 0);

  // 4) Derivados
  const saldo = Math.max(totalServicios - totalAbonos, 0);
  const estatus = saldo <= 0 ? 'Pagado' : 'Pendiente';

  // 5) Actualizar ECC (total, abonado, saldo y estatus)
  await conn.query(
    `UPDATE estado_cuenta_clientes
        SET total = ?, abonado = ?, saldo = ?, estatus = ?, actualizado_en = NOW()
      WHERE id = ?`,
    [totalServicios, totalAbonos, saldo, estatus, eccId]
  );

  // 6) Resumen para el caller
  return { eccFolio, eccId, totalServicios, totalAbonos, saldo, estatus };
};
