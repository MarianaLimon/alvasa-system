const db = require('../config/db');

async function sincronizarECCDesdeProceso(procesoId) {
  try {
    // Traer datos base desde PO + subforms
    const [rows] = await db.promise().query(
      `
      SELECT 
        po.id AS proceso_id,
        c.nombre AS cliente,
        ie.no_contenedor AS contenedor,
        po.tipo_carga AS tipo_carga,
        po.mercancia AS mercancia,
        src.entrega AS fecha_entrega
      FROM procesos_operativos po
      LEFT JOIN clientes c ON c.id = po.cliente_id
      LEFT JOIN informacion_embarque ie ON ie.proceso_operativo_id = po.id
      LEFT JOIN salida_retorno_contenedor src ON src.proceso_operativo_id = po.id
      WHERE po.id = ?
      `,
      [procesoId]
    );

    if (!rows.length) {
      console.log('⚠️ No se encontró el Proceso Operativo para sincronizar ECC:', procesoId);
      return 'sin-proceso';
    }

    const d = rows[0];

    // Actualizar ECC por id_proceso_operativo con los NOMBRES DE COLUMNA REALES
    const [result] = await db.promise().query(
      `
      UPDATE estado_cuenta_clientes
      SET 
        cliente       = ?,
        contenedor    = ?,
        tipo_carga    = ?,
        mercancia     = ?,
        fecha_entrega = ?
      WHERE id_proceso_operativo = ?
      `,
      [
        d.cliente || null,
        d.contenedor || null,
        d.tipo_carga || null,
        d.mercancia || null,
        d.fecha_entrega || null,
        procesoId
      ]
    );

    if (result.affectedRows === 0) {
      console.log('ℹ️ No había ECC vinculado a este proceso (no se actualizó ninguna fila).');
      return 'sin-ecc';
    }

    console.log('✅ ECC sincronizado (datos generales) desde Proceso Operativo:', procesoId);
    return 'ok';
  } catch (error) {
    console.error('❌ Error sincronizando ECC (datos generales):', error);
    return 'error';
  }
}

module.exports = { sincronizarECCDesdeProceso };