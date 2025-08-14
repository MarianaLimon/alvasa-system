const db = require('../../config/db');
const { insertarOCrearEstadoCuenta } = require('../clientesEC/estadoCuentaClientesController');
const { sincronizarServiciosEstadoCuenta } = require('../../utils/sincronizarServiciosEstadoCuenta');

exports.guardarPaqueteria = async (req, res) => {
  const { empresa, costo, venta } = req.body;
  const asignacionId = req.params.id;

  try {
    // Guardar o actualizar en paqueteria_costos
    await db.promise().query(
      `INSERT INTO paqueteria_costos (asignacion_id, empresa, costo, venta)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE empresa = VALUES(empresa), costo = VALUES(costo), venta = VALUES(venta)`,
      [asignacionId, empresa, costo, venta]
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

    res.status(200).json({ message: 'Paquetería guardada correctamente' });
  } catch (error) {
    console.error('❌ Error al guardar paquetería:', error);
    res.status(500).json({ message: 'Error al guardar paquetería' });
  }
};

exports.obtenerPaqueteria = async (req, res) => {
  const asignacionId = req.params.id;

  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM paqueteria_costos WHERE asignacion_id = ?',
      [asignacionId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No se encontró paquetería' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener paquetería:', error);
    res.status(500).json({ message: 'Error al obtener paquetería' });
  }
};
