const db = require('../../config/db');

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

    db.query(consultaInsertar, valores, (err, resultado) => {
      if (err) {
        console.error('❌ Error en la consulta INSERT:', err);
        return res.status(500).json({ mensaje: 'Error al crear la asignación de costos' });
      }
      res.status(201).json({ mensaje: 'Asignación creada correctamente', id: resultado.insertId });
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

  db.query('SELECT * FROM asignacion_costos WHERE folio_proceso = ?', [folio], (err, resultados) => {
    if (err) return res.status(500).json({ mensaje: 'Error al buscar por folio' });
    if (resultados.length === 0) return res.status(404).json({ mensaje: 'No se encontró asignación con ese folio' });
    res.json(resultados[0]);
  });
};

// Actualizar una asignación por ID 
const actualizarAsignacion = (req, res) => {
  const id = req.params.id;
  const {
    clienteId, nombreCliente, ejecutivoCuenta, noContenedor, mercancia, tipoCarga, salidaAduana,
    aaDespacho, forwarder, consignatario, naviera
  } = req.body;

  const sql = `
    UPDATE asignacion_costos
    SET cliente_id = ?, nombre_cliente = ?, ejecutivo_cuenta = ?, no_contenedor = ?,
        mercancia = ?, tipo_carga = ?, salida_aduana = ?, aa_despacho = ?, forwarder = ?,
        consignatario = ?, naviera = ?
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
    aaDespacho,
    forwarder,
    consignatario,
    naviera,
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

module.exports = {
  crearAsignacionCostos,
  obtenerAsignaciones,
  obtenerAsignacionPorId,
  actualizarAsignacion,
  eliminarAsignacion,
  obtenerPorProcesoOperativo,
  obtenerPorFolio
};