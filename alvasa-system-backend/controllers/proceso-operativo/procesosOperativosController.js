const db = require('../../config/db');
const ejs = require('ejs');
const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');

const { sincronizarAADespacho, sincronizarForwarder } = require('../../utils/sincronizarAsignacion');

const { sincronizarECCDesdeProceso } = require('../../utils/sincronizarECCDatos');

const { calcularEstatusYGuardar } = require('../../utils/estatusProceso');


// Formatear fecha estilo MX
function formatoFecha(date) {
  const f = new Date(date);
  return isNaN(f) ? '—' : `${f.getDate()}/${f.getMonth() + 1}/${f.getFullYear()}`;
}

// Codificar el logo
const logoPath = path.join(__dirname, '../../public/images/alvasa-logo-new.jpg');
const logoData = (() => {
  try {
    const img = fs.readFileSync(logoPath);
    return 'data:image/jpeg;base64,' + img.toString('base64');
  } catch {
    return null;
  }
})();

// Función para generar folio
const generarFolioProceso = (callback) => {
  const sql = 'SELECT folio_proceso FROM procesos_operativos ORDER BY id DESC LIMIT 1';
  db.query(sql, (err, result) => {
    if (err) return callback(err);

    let nuevoNumero = 1;

    if (result.length > 0 && result[0].folio_proceso) {
      const ultimoFolio = result[0].folio_proceso; // ej. PROC-0010
      const numero = parseInt(ultimoFolio.split('-')[1]); // 10
      nuevoNumero = numero + 1;
    }

    const folio = `PROC-${nuevoNumero.toString().padStart(4, '0')}`;
    callback(null, folio);
  });
};

// Crear proceso operativo completo
exports.crearProcesoOperativo = (req, res) => {
  const {
    clienteId, docPO, mercancia, fechaAlta, tipoImportacion,
    ejecutivoCuenta, tipoCarga, valorMercancia, linksDrive,
    etd, cotizacionId, observaciones,
    informacionEmbarque, procesoRevalidacion,
    datosPedimento, salidaRetornoContenedor
  } = req.body;

  console.log('Campos a guardar:', { ejecutivoCuenta, tipoCarga, valorMercancia });

  const cotizacion_id_final = cotizacionId === '' ? null : cotizacionId;

  generarFolioProceso((err, folioProceso) => {
    if (err) {
      console.error('Error al generar folio:', err);
      return res.status(500).json({ error: 'Error al generar folio del proceso operativo' });
    }

    const sqlPrincipal = `
      INSERT INTO procesos_operativos
      (folio_proceso, cliente_id, doc_po, mercancia, fecha_alta, tipo_importacion,
      ejecutivo_cuenta, tipo_carga, valor_mercancia, links_drive,
      etd, cotizacion_id, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sqlPrincipal, [
      folioProceso, clienteId, docPO, mercancia, fechaAlta,
      tipoImportacion, ejecutivoCuenta, tipoCarga, valorMercancia,
      linksDrive, etd, cotizacion_id_final, observaciones 
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
            
            calcularEstatusYGuardar(procesoId)
            .then((est) => {
              res.status(201).json({ message: 'Proceso operativo creado correctamente', id: procesoId, estatus: est });
            })
            .catch(() => {
              res.status(201).json({ message: 'Proceso operativo creado correctamente', id: procesoId });
            });

          }
        });
      });
    });
  });
};

// Función auxiliar para actualizar asignación de costos
const actualizarAsignacionRelacionado = (datos) => {
  const sql = `
    UPDATE asignacion_costos
    SET nombre_cliente = ?, ejecutivo_cuenta = ?, no_contenedor = ?, mercancia = ?, tipo_carga = ?, salida_aduana = ?
    WHERE proceso_operativo_id = ?
  `;

  const valores = [
    datos.nombreCliente || datos.cliente || '',
    datos.ejecutivo_cuenta,
    datos.informacion_embarque?.no_contenedor || '',
    datos.mercancia,
    datos.tipo_carga,
    datos.salida_retorno_contenedor?.salida_aduana || '',
    datos.id
  ];

  db.query(sql, valores, (err) => {
    if (err) {
      console.error('❌ Error al actualizar asignación relacionada:', err);
    } else {
      console.log('✅ Asignación relacionada actualizada correctamente');
    }
  });
};

// Obtener todos los procesos operativos
exports.obtenerProcesosOperativos = (req, res) => {
  const sql = `
    SELECT 
      po.id,
      po.folio_proceso,
      po.ejecutivo_cuenta,
      c.nombre AS cliente,
      po.mercancia,
      po.fecha_alta,
      ie.no_contenedor,
      ie.naviera,
      ie.pais_origen,
      po.estatus,
      po.estatus_codigo,
      CASE 
        WHEN ac.id IS NOT NULL THEN 1
        ELSE 0
      END AS tiene_asignacion
    FROM procesos_operativos po
    LEFT JOIN clientes c ON po.cliente_id = c.id
    LEFT JOIN informacion_embarque ie ON po.id = ie.proceso_operativo_id
    LEFT JOIN asignacion_costos ac ON po.id = ac.proceso_operativo_id
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
    SELECT po.*, c.nombre AS cliente,
      CASE 
        WHEN ac.id IS NOT NULL THEN 1
        ELSE 0
      END AS tiene_asignacion
    FROM procesos_operativos po
    LEFT JOIN clientes c ON po.cliente_id = c.id
    LEFT JOIN asignacion_costos ac ON po.id = ac.proceso_operativo_id
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

    // Procesamos links_drive para convertirlo en un arreglo
    datosCompletos.links_drive_array = proceso.links_drive
      ? proceso.links_drive.split('\n').map(link => link.trim()).filter(link => link)
      : [];

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
          calcularEstatusYGuardar(id)
            .then(() => res.json(datosCompletos))
            .catch(() => res.json(datosCompletos));
        }
      });
    }
  });
};

exports.actualizarProcesoOperativo = (req, res) => {
  const nombreClienteDesdeCliente = req.body.nombreCliente || '';
  const { id } = req.params;
  const {
    clienteId, docPO, mercancia, fechaAlta, tipoImportacion,
    ejecutivoCuenta, tipoCarga, valorMercancia,
    etd, cotizacionId, observaciones, linksDrive,
    informacionEmbarque, procesoRevalidacion,
    datosPedimento, salidaRetornoContenedor,
    nombreCliente
  } = req.body;

  const cotizacion_id_final = cotizacionId === '' ? null : cotizacionId;

  const sqlPrincipal = `
    UPDATE procesos_operativos
    SET cliente_id = ?, doc_po = ?, mercancia = ?, fecha_alta = ?, tipo_importacion = ?,
        ejecutivo_cuenta = ?, tipo_carga = ?, valor_mercancia = ?,
        etd = ?, cotizacion_id = ?, observaciones = ?, links_drive = ?
    WHERE id = ?
  `;

  db.query(sqlPrincipal, [
    clienteId, docPO, mercancia, fechaAlta, tipoImportacion,
    ejecutivoCuenta, tipoCarga, valorMercancia,
    etd, cotizacion_id_final, observaciones, linksDrive, id
  ], (err) => {
    if (err) {
      console.error('Error al actualizar proceso principal:', err);
      return res.status(500).json({ error: 'Error al actualizar proceso operativo' });
    }

    const updates = [
      {
        sql: `
          UPDATE informacion_embarque SET hbl=?, no_contenedor=?, shipper=?, icoterm=?, consignatario=?, forwarde=?, tipo=?, peso_bl=?, peso_real=?, vessel=?, naviera=?, pol=?, pais_origen=?, pod=?, pais_destino=?
          WHERE proceso_operativo_id=?
        `,
        values: [
          informacionEmbarque.hbl, informacionEmbarque.noContenedor, informacionEmbarque.shipper, informacionEmbarque.icoterm,
          informacionEmbarque.consignatario, informacionEmbarque.forwarde, informacionEmbarque.tipo,
          informacionEmbarque.pesoBL, informacionEmbarque.pesoReal, informacionEmbarque.vessel, informacionEmbarque.naviera,
          informacionEmbarque.pol, informacionEmbarque.paisOrigen, informacionEmbarque.pod, informacionEmbarque.paisDestino, id
        ]
      },
      {
        sql: `
          UPDATE proceso_revalidacion SET mbl=?, eta=?, descarga=?, terminal=?, revalidacion=?, recepcion_envio_docs=?
          WHERE proceso_operativo_id=?
        `,
        values: [
          procesoRevalidacion.mbl, procesoRevalidacion.eta, procesoRevalidacion.descarga,
          procesoRevalidacion.terminal, procesoRevalidacion.revalidacion, procesoRevalidacion.recepcionEnvioDocs, id
        ]
      },
      {
        sql: `
          UPDATE datos_pedimento SET pedimento=?, pago_pedimento=?, regimen=?, aa_despacho=?, agente_aduanal=?
          WHERE proceso_operativo_id=?
        `,
        values: [
          datosPedimento.pedimento, datosPedimento.pagoPedimento,
          datosPedimento.regimen, datosPedimento.aaDespacho, datosPedimento.agenteAduanal, id
        ]
      },
      {
        sql: `
          UPDATE salida_retorno_contenedor SET salida_aduana=?, entrega=?, f_max=?, entrega_vacio=?, condiciones_contenedor=?, terminal_vacio=?
          WHERE proceso_operativo_id=?
        `,
        values: [
          salidaRetornoContenedor.salidaAduana, salidaRetornoContenedor.entrega, salidaRetornoContenedor.fMax,
          salidaRetornoContenedor.entregaVacio, salidaRetornoContenedor.condicionesContenedor, salidaRetornoContenedor.terminalVacio, id
        ]
      }
    ];

    let errores = [];
    let completadas = 0;

    updates.forEach(({ sql, values }) => {
      db.query(sql, values, (err) => {
        if (err) {
          console.error('Error al actualizar subformulario:', err);
          errores.push(err);
        }
        completadas++;
        if (completadas === updates.length) {
          if (errores.length > 0) {
            return res.status(207).json({ message: 'Proceso actualizado con errores en subformularios', errors: errores });
          }

          const actualizarAsignacionRelacionado = `
            UPDATE asignacion_costos
            SET nombre_cliente = ?, ejecutivo_cuenta = ?, mercancia = ?, tipo_carga = ?, no_contenedor = ?, salida_aduana = ?
            WHERE proceso_operativo_id = ?
          `;

          const valoresAsignacion = [
            nombreClienteDesdeCliente, ejecutivoCuenta, mercancia, tipoCarga,
            informacionEmbarque.noContenedor,
            salidaRetornoContenedor.salidaAduana,
            id
          ];

          db.query(actualizarAsignacionRelacionado, valoresAsignacion, async (errAsignacion) => {
            if (errAsignacion) {
              console.warn('⚠️ No se pudo actualizar asignación relacionada:', errAsignacion);
              return res.status(200).json({ message: 'Proceso operativo actualizado, pero no se actualizó asignación relacionada.' });
            }

            try {
              const proveedorNuevo = datosPedimento.aaDespacho || '';
              const resultadoSync = await sincronizarAADespacho(id, proveedorNuevo);

              const resultadoForwarder = await sincronizarForwarder(id, { informacion_embarque: informacionEmbarque });

              console.log('✅ Sincronización AA Despacho:', resultadoSync);
              console.log('✅ Sincronización Forwarder:', resultadoForwarder);

              const resultadoECC = await sincronizarECCDesdeProceso(id);
              console.log('✅ Sincronización ECC (datos generales):', resultadoECC);

              // 🔹 Aquí llamamos al motor de estatus ANTES de responder
              try {
                const est = await calcularEstatusYGuardar(id);
                return res.status(200).json({
                  message: 'Proceso operativo y asignación actualizados correctamente. ' +
                          resultadoSync + '. ' + resultadoForwarder + '. ECC:' + resultadoECC,
                  estatus: est
                });
              } catch (e) {
                console.warn('⚠️ No se pudo recalcular estatus al actualizar:', e);
                return res.status(200).json({
                  message: 'Proceso operativo y asignación actualizados, pero no se pudo recalcular estatus. ' +
                          resultadoSync + '. ' + resultadoForwarder + '. ECC:' + resultadoECC
                });
              }

            } catch (syncError) {
              console.error('❌ Error al sincronizar subformularios:', syncError);
              return res.status(200).json({
                message: 'Proceso operativo actualizado. Falló sincronización de subformularios/ECC.',
                error: syncError
              });
            }

          });
        }
      });
    });
  });
};

// Eliminar proceso operativo
exports.eliminarProcesoOperativo = (req, res) => {
  const { id } = req.params;

  const tablasSubformularios = [
    'informacion_embarque',
    'proceso_revalidacion',
    'datos_pedimento',
    'salida_retorno_contenedor'
  ];

  let completadas = 0;
  let errores = [];

  tablasSubformularios.forEach(tabla => {
    const sql = `DELETE FROM ${tabla} WHERE proceso_operativo_id = ?`;
    db.query(sql, [id], (err) => {
      if (err) {
        console.error(`Error al eliminar de ${tabla}:`, err);
        errores.push({ tabla, error: err });
      }
      completadas++;
      if (completadas === tablasSubformularios.length) {
        // Una vez eliminados los subformularios, eliminar el proceso principal
        const sqlPrincipal = `DELETE FROM procesos_operativos WHERE id = ?`;
        db.query(sqlPrincipal, [id], (err) => {
          if (err) {
            console.error('Error al eliminar el proceso operativo:', err);
            return res.status(500).json({ error: 'Error al eliminar el proceso principal' });
          }
          if (errores.length > 0) {
            return res.status(207).json({ message: 'Proceso eliminado parcialmente', errores });
          }
          res.status(200).json({ message: 'Proceso operativo eliminado correctamente' });
        });
      }
    });
  });
};

// Generar PDF

const obtenerDatosDelProceso = require('../../utils/obtenerDatosDelProceso');
exports.generarPDFProcesoOperativo = async (req, res) => {
  const { id } = req.params;

  try {
    const procesoCompleto = await obtenerDatosDelProceso(id);

    const html = await ejs.renderFile(
      path.join(__dirname, '../../views/proceso.ejs'),
      {
        proceso: procesoCompleto,
        formatoFecha,
        logo: logoData
      }
    );

    const browser = await puppeteer.launch({ headless: 'new' });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const buffer = await page.pdf({ format: 'A4' });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=proceso-${id}.pdf`,
    });

    res.send(buffer);
  } catch (error) {
    console.error('Error al generar PDF del proceso:', error);
    res.status(500).json({ error: 'Error al generar PDF del proceso' });
  }
};