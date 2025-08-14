const db = require('../../config/db');
const { insertarOCrearEstadoCuenta } = require('../clientesEC/estadoCuentaClientesController');
const { sincronizarServiciosEstadoCuenta } = require('../../utils/sincronizarServiciosEstadoCuenta');

// Función para convertir vacío o inválido a 0
const parseDecimal = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
};

// POST o PUT - Guardar Aseguradora
exports.guardarAseguradora = async (req, res) => {
  const asignacionId = req.params.id;
  const { aseguradora, costo, venta, valorMercancia } = req.body;

  try {
    // Guardar o actualizar en aseguradora_costos
    await db.promise().query(
      `INSERT INTO aseguradora_costos (asignacion_id, aseguradora, costo, venta, valor_mercancia)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE aseguradora = VALUES(aseguradora), costo = VALUES(costo), venta = VALUES(venta), valor_mercancia = VALUES(valor_mercancia)`,
      [asignacionId, aseguradora, parseDecimal(costo), parseDecimal(venta), parseDecimal(valorMercancia)]
    );

    // Obtener proceso operativo relacionado
    const [[proceso]] = await db.promise().query(
      'SELECT proceso_operativo_id FROM asignacion_costos WHERE id = ?',
      [asignacionId]
    );

    if (proceso?.proceso_operativo_id) {
      const procesoId = proceso.proceso_operativo_id;
      await insertarOCrearEstadoCuenta(asignacionId, procesoId);
      await sincronizarServiciosEstadoCuenta(asignacionId, procesoId);
    }

    res.json({ mensaje: 'Aseguradora guardada correctamente' });
  } catch (error) {
    console.error('❌ Error al guardar aseguradora:', error);
    res.status(500).json({ mensaje: 'Error al guardar aseguradora' });
  }
};

// GET - Obtener Aseguradora
exports.obtenerAseguradora = async (req, res) => {
  const asignacionId = req.params.id;

  try {
    const [resultados] = await db.promise().query(
      'SELECT * FROM aseguradora_costos WHERE asignacion_id = ?',
      [asignacionId]
    );

    if (resultados.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontró aseguradora para esta asignación' });
    }

    res.json(resultados[0]);
  } catch (error) {
    console.error('❌ Error al obtener aseguradora:', error);
    res.status(500).json({ mensaje: 'Error al obtener aseguradora' });
  }
};
