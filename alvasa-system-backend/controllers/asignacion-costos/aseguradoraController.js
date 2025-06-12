const db = require('../../config/db');

// Guardar o actualizar aseguradora
exports.guardarAseguradora = async (req, res) => {
  const asignacionId = req.params.id;
  if (!asignacionId) {
    return res.status(400).json({ message: 'ID de asignación requerido' });
  }

  let { aseguradora, costo, venta, valorMercancia } = req.body;

  // Sanitizar valores
  const aseguradoraSafe = aseguradora || '';
  const costoSafe = isNaN(parseFloat(costo)) ? '0.00' : costo;
  const ventaSafe = isNaN(parseFloat(venta)) ? '0.00' : venta;
  const valorMercanciaSafe = isNaN(parseFloat(valorMercancia)) ? '0.00' : valorMercancia;

  try {
    await db.promise().query(
      `INSERT INTO aseguradora_costos (asignacion_id, aseguradora, costo, venta, valor_mercancia)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         aseguradora = VALUES(aseguradora),
         costo = VALUES(costo),
         venta = VALUES(venta),
         valor_mercancia = VALUES(valor_mercancia)`,
      [asignacionId, aseguradoraSafe, costoSafe, ventaSafe, valorMercanciaSafe]
    );

    res.status(200).json({ message: 'Aseguradora guardada correctamente' });
  } catch (error) {
    console.error('Error al guardar aseguradora:', error);
    res.status(500).json({ message: 'Error al guardar aseguradora' });
  }
};

// Obtener aseguradora por asignación
exports.obtenerAseguradora = async (req, res) => {
  const asignacionId = req.params.id;
  if (!asignacionId) {
    return res.status(400).json({ message: 'ID de asignación requerido' });
  }

  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM aseguradora_costos WHERE asignacion_id = ?',
      [asignacionId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No se encontró aseguradora' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener aseguradora:', error);
    res.status(500).json({ message: 'Error al obtener aseguradora' });
  }
};