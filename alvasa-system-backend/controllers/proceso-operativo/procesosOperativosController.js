const db = require('../../config/db');

// Función para generar folio
const generarFolioProceso = (callback) => {
  const sql = 'SELECT COUNT(*) AS total FROM procesos_operativos';
  db.query(sql, (err, result) => {
    if (err) return callback(err);
    const numero = result[0].total + 1;
    const folio = `PROC-${numero.toString().padStart(4, '0')}`;
    callback(null, folio);
  });
};

// Crear proceso operativo completo
exports.crearProcesoOperativo = (req, res) => {
  const {
    clienteId, docPO, mercancia, fechaAlta, tipoImportacion,
    etd, cotizacionId, observaciones,
    informacionEmbarque, procesoRevalidacion,
    datosPedimento, salidaRetornoContenedor
  } = req.body;

  const cotizacion_id_final = cotizacionId === '' ? null : cotizacionId;

  generarFolioProceso((err, folioProceso) => {
    if (err) {
      console.error('Error al generar folio:', err);
      return res.status(500).json({ error: 'Error al generar folio del proceso operativo' });
    }

    const sqlPrincipal = `
      INSERT INTO procesos_operativos
      (folio_proceso, cliente_id, doc_po, mercancia, fecha_alta, tipo_importacion, etd, cotizacion_id, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sqlPrincipal, [
      folioProceso, clienteId, docPO, mercancia, fechaAlta,
      tipoImportacion, etd, cotizacion_id_final, observaciones
    ], (err, result) => {
      if (err) {
        console.error('Error al insertar proceso operativo:', err);
        return res.status(500).json({ error: 'Error al guardar proceso operativo' });
      }

      const procesoId = result.insertId;

      const queries = [
        {
          sql: `INSERT INTO informacion_embarque
                (proceso_operativo_id, hbl, no_contenedor, shipper, icoterm, consignatario, forwarde, tipo, peso_bl, peso_real, vessel, naviera, pol, pais_origen, pod, pais_destino)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          values: [
            procesoId,
            informacionEmbarque.hbl, informacionEmbarque.noContenedor, informacionEmbarque.shipper, informacionEmbarque.icoterm,
            informacionEmbarque.consignatario, informacionEmbarque.forwarde, informacionEmbarque.tipo,
            informacionEmbarque.pesoBL, informacionEmbarque.pesoReal, informacionEmbarque.vessel, informacionEmbarque.naviera,
            informacionEmbarque.pol, informacionEmbarque.paisOrigen, informacionEmbarque.pod, informacionEmbarque.paisDestino
          ]
        },
        {
          sql: `INSERT INTO proceso_revalidacion
                (proceso_operativo_id, mbl, eta, descarga, terminal, revalidacion, recepcion_envio_docs)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          values: [
            procesoId,
            procesoRevalidacion.mbl, procesoRevalidacion.eta, procesoRevalidacion.descarga,
            procesoRevalidacion.terminal, procesoRevalidacion.revalidacion, procesoRevalidacion.recepcionEnvioDocs
          ]
        },
        {
          sql: `INSERT INTO datos_pedimento
                (proceso_operativo_id, pedimento, pago_pedimento, regimen, aa_despacho, agente_aduanal)
                VALUES (?, ?, ?, ?, ?, ?)`,
          values: [
            procesoId,
            datosPedimento.pedimento, datosPedimento.pagoPedimento,
            datosPedimento.regimen, datosPedimento.aaDespacho, datosPedimento.agenteAduanal
          ]
        },
        {
          sql: `INSERT INTO salida_retorno_contenedor
                (proceso_operativo_id, salida_aduana, entrega, f_max, entrega_vacio, condiciones_contenedor, terminal_vacio)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          values: [
            procesoId,
            salidaRetornoContenedor.salidaAduana, salidaRetornoContenedor.entrega, salidaRetornoContenedor.fMax,
            salidaRetornoContenedor.entregaVacio, salidaRetornoContenedor.condicionesContenedor, salidaRetornoContenedor.terminalVacio
          ]
        }
      ];

      let subformErrors = [];
      let completadas = 0;
      queries.forEach(({ sql, values }) => {
        db.query(sql, values, (error) => {
          if (error) {
            console.error('Error al insertar subformulario:', error);
            subformErrors.push(error);
          }
          completadas++;
          if (completadas === queries.length) {
            if (subformErrors.length > 0) {
              return res.status(207).json({ message: 'Proceso principal guardado, pero hubo errores en subformularios.', errors: subformErrors });
            }
            res.status(201).json({ message: 'Proceso operativo creado correctamente', id: procesoId });
          }
        });
      });
    });
  });
};

// Obtener todos los procesos operativos
exports.obtenerProcesosOperativos = (req, res) => {
  const sql = `
    SELECT po.id, po.folio_proceso, c.nombre AS cliente, po.mercancia, po.fecha_alta, ie.no_contenedor, ie.naviera, ie.pais_origen
    FROM procesos_operativos po
    LEFT JOIN clientes c ON po.cliente_id = c.id
    LEFT JOIN informacion_embarque ie ON po.id = ie.proceso_operativo_id
    ORDER BY po.fecha_alta DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener procesos operativos:', err);
      return res.status(500).json({ error: 'Error al obtener procesos operativos' });
    }
    res.json(results);
  });
};

// Obtener proceso operativo por ID con subformularios
exports.obtenerProcesoOperativoPorId = (req, res) => {
  const { id } = req.params;

  const consultaProceso = `
    SELECT po.*, c.nombre AS cliente
    FROM procesos_operativos po
    LEFT JOIN clientes c ON po.cliente_id = c.id
    WHERE po.id = ?
  `;

  const consultasSubformularios = {
    informacion_embarque: 'SELECT * FROM informacion_embarque WHERE proceso_operativo_id = ?',
    proceso_revalidacion: 'SELECT * FROM proceso_revalidacion WHERE proceso_operativo_id = ?',
    datos_pedimento: 'SELECT * FROM datos_pedimento WHERE proceso_operativo_id = ?',
    salida_retorno_contenedor: 'SELECT * FROM salida_retorno_contenedor WHERE proceso_operativo_id = ?',
  };

  db.query(consultaProceso, [id], (err, resultProceso) => {
    if (err || resultProceso.length === 0) {
      console.error('Error al obtener el proceso:', err);
      return res.status(404).json({ error: 'Proceso operativo no encontrado' });
    }

    const proceso = resultProceso[0];
    const datosCompletos = { ...proceso };

    let consultasCompletadas = 0;
    const totalConsultas = Object.keys(consultasSubformularios).length;

    for (const [clave, query] of Object.entries(consultasSubformularios)) {
      db.query(query, [id], (error, subResult) => {
        if (error) {
          console.error(`Error al obtener ${clave}:`, error);
        }
        datosCompletos[clave] = subResult[0] || {};
        consultasCompletadas++;

        if (consultasCompletadas === totalConsultas) {
          res.json(datosCompletos);
        }
      });
    }
  });
};