const db = require('../../config/db');

// Función para convertir vacío o inválido a 0
const parseDecimal = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
};

// POST o PUT - Guardar Custodia
const guardarCustodia = async (req, res) => {
  const asignacionId = req.params.id;
  const {
    custodiaProveedor,
    custodiaCosto, custodiaVenta,
    custodiaPernoctaCosto, custodiaPernoctaVenta,
    custodiaFalsoCosto, custodiaFalsoVenta,
    custodiaCancelacionCosto, custodiaCancelacionVenta,
    custodiaDiasCosto, custodiaDiasVenta,
    custodiaCostoAlmacenaje, custodiaVentaAlmacenaje
  } = req.body;

  try {
    // Verifica si ya existe registro para esta asignación
    const [existente] = await db.promise().query(
      'SELECT id FROM custodia_costos WHERE asignacion_id = ?',
      [asignacionId]
    );

    if (existente.length > 0) {
      // Si existe, actualizar
      await db.promise().query(`
        UPDATE custodia_costos
        SET
          custodia_proveedor = ?, custodia_costo = ?, custodia_venta = ?,
          custodia_pernocta_costo = ?, custodia_pernocta_venta = ?,
          custodia_falso_costo = ?, custodia_falso_venta = ?,
          custodia_cancelacion_costo = ?, custodia_cancelacion_venta = ?,
          custodia_dias_costo = ?, custodia_dias_venta = ?,
          custodia_costo_almacenaje = ?, custodia_venta_almacenaje = ?
        WHERE asignacion_id = ?
      `, [
        custodiaProveedor,
        parseDecimal(custodiaCosto), parseDecimal(custodiaVenta),
        parseDecimal(custodiaPernoctaCosto), parseDecimal(custodiaPernoctaVenta),
        parseDecimal(custodiaFalsoCosto), parseDecimal(custodiaFalsoVenta),
        parseDecimal(custodiaCancelacionCosto), parseDecimal(custodiaCancelacionVenta),
        parseDecimal(custodiaDiasCosto), parseDecimal(custodiaDiasVenta),
        parseDecimal(custodiaCostoAlmacenaje), parseDecimal(custodiaVentaAlmacenaje),
        asignacionId
      ]);
    } else {
      // Si no existe, insertar nuevo
      await db.promise().query(`
        INSERT INTO custodia_costos (
          asignacion_id, custodia_proveedor,
          custodia_costo, custodia_venta,
          custodia_pernocta_costo, custodia_pernocta_venta,
          custodia_falso_costo, custodia_falso_venta,
          custodia_cancelacion_costo, custodia_cancelacion_venta,
          custodia_dias_costo, custodia_dias_venta,
          custodia_costo_almacenaje, custodia_venta_almacenaje
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        asignacionId, custodiaProveedor,
        parseDecimal(custodiaCosto), parseDecimal(custodiaVenta),
        parseDecimal(custodiaPernoctaCosto), parseDecimal(custodiaPernoctaVenta),
        parseDecimal(custodiaFalsoCosto), parseDecimal(custodiaFalsoVenta),
        parseDecimal(custodiaCancelacionCosto), parseDecimal(custodiaCancelacionVenta),
        parseDecimal(custodiaDiasCosto), parseDecimal(custodiaDiasVenta),
        parseDecimal(custodiaCostoAlmacenaje), parseDecimal(custodiaVentaAlmacenaje)
      ]);
    }

    res.json({ mensaje: 'Custodia guardada correctamente' });
  } catch (error) {
    console.error('❌ Error al guardar custodia:', error);
    res.status(500).json({ mensaje: 'Error al guardar custodia' });
  }
};

// GET - Obtener Custodia
const obtenerCustodia = async (req, res) => {
  const asignacionId = req.params.id;

  try {
    const [resultados] = await db.promise().query(
      'SELECT * FROM custodia_costos WHERE asignacion_id = ?',
      [asignacionId]
    );

    if (resultados.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontró custodia para esta asignación' });
    }

    res.json(resultados[0]);
  } catch (error) {
    console.error('❌ Error al obtener custodia:', error);
    res.status(500).json({ mensaje: 'Error al obtener custodia' });
  }
};

module.exports = {
  guardarCustodia,
  obtenerCustodia
};