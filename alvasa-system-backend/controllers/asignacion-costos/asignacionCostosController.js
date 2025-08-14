const db = require('../../config/db');

const { insertarOCrearEstadoCuenta } = require('../clientesEC/estadoCuentaClientesController');
const { sincronizarServiciosEstadoCuenta } = require('../../utils/sincronizarServiciosEstadoCuenta');


const crearAsignacionCostos = (req, res) => {
  console.log('📩 Entró a crearAsignacionCostos');
  console.log('➡️  Body recibido:', req.body);

  const {
    folioProceso,
    clienteId,
    nombreCliente,        
    ejecutivoCuenta,
    noContenedor,
    mercancia,
    tipoCarga,
    salidaAduana,
    procesoOperativoId
  } = req.body;

  const consultaVerificacion = 'SELECT * FROM asignacion_costos WHERE folio_proceso = ?';
  db.query(consultaVerificacion, [folioProceso], (err, resultados) => {
    if (err) return res.status(500).json({ mensaje: 'Error interno del servidor' });
    if (resultados.length > 0) {
      return res.status(400).json({ mensaje: 'Ya existe una asignación para este folio de proceso' });
    }
    
    console.log('🧪 Claves recibidas:', Object.keys(req.body));

    const consultaInsertar = `
      INSERT INTO asignacion_costos
      (proceso_operativo_id, cliente_id, nombre_cliente, ejecutivo_cuenta, folio_proceso,
       mercancia, tipo_carga, no_contenedor, salida_aduana)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
      procesoOperativoId,
      clienteId,
      nombreCliente,
      ejecutivoCuenta,
      folioProceso,
      mercancia,
      tipoCarga,
      noContenedor,
      salidaAduana
    ];

    db.query(consultaInsertar, valores, async (err, resultado) => {
      if (err) {
        console.error('❌ Error al insertar asignación:', err);
        return res.status(500).json({ mensaje: 'Error interno del servidor' });
      }

      try {
        const asignacionId = resultado.insertId;

        // ✅ Crea/actualiza el Estado de Cuenta inmediatamente
        await insertarOCrearEstadoCuenta(asignacionId, procesoOperativoId);

        // ✅ Sincroniza servicios en ECC (quedarán en 0 si aún no hay ventas)
        await sincronizarServiciosEstadoCuenta(asignacionId, procesoOperativoId);

        return res.status(201).json({
          mensaje: 'Asignación creada correctamente',
          id: asignacionId
        });
      } catch (syncErr) {
        console.error('❌ Error al sincronizar ECC justo después de crear la asignación:', syncErr);
        // Aun así responde 201 para no romper el flujo del frontend, pero avisa:
        return res.status(201).json({
          mensaje: 'Asignación creada; hubo un problema sincronizando el ECC',
          id: resultado.insertId
        });
      }
    });

  });
};

// Obtener todas las asignaciones
const obtenerAsignaciones = (req, res) => {
  db.query('SELECT * FROM asignacion_costos ORDER BY id DESC', (err, resultados) => {
    if (err) return res.status(500).json({ mensaje: 'Error al obtener asignaciones' });
    res.json(resultados);
  });
};

// Obtener una asignación por ID
const obtenerAsignacionPorId = (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM asignacion_costos WHERE id = ?', [id], (err, resultados) => {
    if (err) return res.status(500).json({ mensaje: 'Error al buscar asignación' });
    if (resultados.length === 0) return res.status(404).json({ mensaje: 'Asignación no encontrada' });
    res.json(resultados[0]);
  });
};

// Obtener una asignación por FOLIO
const obtenerPorFolio = (req, res) => {
  const folio = req.params.folio;

  const sql = `
    SELECT 
      ac.*, 
      ad.aa_despacho AS aa_despacho_asignacion
    FROM asignacion_costos AS ac
    LEFT JOIN aa_despacho_costos AS ad
      ON ad.asignacion_id = ac.id
    WHERE ac.folio_proceso = ?
    LIMIT 1
  `;

  db.query(sql, [folio], (err, resultados) => {
    if (err) {
      console.error('Error en JOIN al buscar por folio:', err);
      return res.status(500).json({ mensaje: 'Error al buscar por folio con JOIN' });
    }
    if (resultados.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontró asignación con ese folio' });
    }

    res.json(resultados[0]);
  });
};

// Actualizar una asignación por ID 
const actualizarAsignacion = (req, res) => {
  const id = req.params.id;
  const {
    clienteId, nombreCliente, ejecutivoCuenta, noContenedor, mercancia, tipoCarga, salidaAduana
  } = req.body;

  const sql = `
    UPDATE asignacion_costos
    SET cliente_id = ?, nombre_cliente = ?, ejecutivo_cuenta = ?, no_contenedor = ?,
        mercancia = ?, tipo_carga = ?, salida_aduana = ?
    WHERE id = ?
  `;

  const valores = [
    clienteId,
    nombreCliente,
    ejecutivoCuenta,
    noContenedor,
    mercancia,
    tipoCarga,
    salidaAduana,
    id
  ];

  db.query(sql, valores, (err) => {
    if (err) {
      console.error('❌ Error al actualizar asignación:', err);
      return res.status(500).json({ mensaje: 'Error al actualizar asignación' });
    }
    res.json({ mensaje: 'Asignación actualizada correctamente' });
  });
};


// Eliminar una asignación
const eliminarAsignacion = (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM asignacion_costos WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ mensaje: 'Error al eliminar la asignación' });
    res.json({ mensaje: 'Asignación eliminada correctamente' });
  });
};

const obtenerPorProcesoOperativo = (req, res) => {
  const procesoId = req.params.procesoId;

  db.query(
    'SELECT * FROM asignacion_costos WHERE proceso_operativo_id = ?',
    [procesoId],
    (err, resultados) => {
      if (err) return res.status(500).json({ mensaje: 'Error al buscar asignación por proceso' });
      if (resultados.length === 0) return res.status(404).json({ mensaje: 'No se encontró asignación para este proceso' });
      res.json(resultados[0]);
    }
  );
};

const obtenerAsignacionCompleta = async (req, res) => {
  const folio = req.params.folio;

  try {
    // 1. Buscar asignación principal
    const [asignaciones] = await db.promise().query('SELECT * FROM asignacion_costos WHERE folio_proceso = ?', [folio]);

    if (asignaciones.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontró la asignación' });
    }

    const asignacion = asignaciones[0];

    // 2. Subformularios
    const [aaDespacho] = await db.promise().query(
      'SELECT * FROM aa_despacho_costos WHERE asignacion_id = ?',
      [asignacion.id]
    );

    const [forwarder] = await db.promise().query(
      'SELECT * FROM forwarder_costos WHERE asignacion_id = ?',
      [asignacion.id]
    );

    const [fleteTerrestre] = await db.promise().query(
      'SELECT * FROM flete_terrestre_costos WHERE asignacion_id = ?',
      [asignacion.id]
    );

    let fleteCompleto = null;

    if (fleteTerrestre.length > 0) {
      const flete = fleteTerrestre[0];

      const [extras] = await db.promise().query(
        'SELECT concepto, costo, venta FROM extras_flete_terrestre WHERE flete_terrestre_id = ?',
        [flete.id]
      );

      fleteCompleto = {
        ...flete,
        extras
      };
    }

    const [custodia] = await db.promise().query(
      'SELECT * FROM custodia_costos WHERE asignacion_id = ?',
      [asignacion.id]
    );

    const [paqueteria] = await db.promise().query(
      'SELECT empresa, costo, venta FROM paqueteria_costos WHERE asignacion_id = ?',
      [asignacion.id]
    );

    const [aseguradora] = await db.promise().query(
      'SELECT * FROM aseguradora_costos WHERE asignacion_id = ?',
      [asignacion.id]
    );

    const [despacho] = await db.promise().query(`
      SELECT 
        d.facturacion,
        d.comision_socio,
        d.propuesta_costo,
        d.cotizacion_folio,
        c.propuesta AS propuesta_cotizacion,
        c.monto_comisionista AS comision_intermediario
      FROM despacho_costos d
      LEFT JOIN cotizaciones c ON d.cotizacion_folio = c.folio
      WHERE d.asignacion_id = ? 
      LIMIT 1
    `, [asignacion.id]);


    // 3. Armar respuesta completa
    const respuesta = {
      ...asignacion,
      aa_despacho: aaDespacho[0] || null,
      forwarder: forwarder[0] || null,
      flete_terrestre: fleteCompleto,
      custodia: custodia[0] || null,
      paqueteria: paqueteria[0] || null,
      aseguradora: aseguradora[0] || null,
       despacho: despacho[0] || null,
    };

    res.json(respuesta);
  } catch (error) {
    console.error('❌ Error al obtener asignación completa:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  crearAsignacionCostos,
  obtenerAsignaciones,
  obtenerAsignacionPorId,
  actualizarAsignacion,
  eliminarAsignacion,
  obtenerPorProcesoOperativo,
  obtenerPorFolio,
  obtenerAsignacionCompleta
};