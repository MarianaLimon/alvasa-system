const db = require('../../config/db');
const { insertarOCrearEstadoCuenta } = require('../clientesEC/estadoCuentaClientesController');
const { sincronizarServiciosEstadoCuenta } = require('../../utils/sincronizarServiciosEstadoCuenta');

const parseDecimal = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
};

const guardarFleteTerrestre = async (req, res) => {
  const asignacionId = req.params.id;
  const {
    proveedor,
    flete, fleteVenta,
    estadia, estadiaVenta,
    burreo, burreoVenta,
    sobrepeso, sobrepesoVenta,
    apoyo, apoyoVenta,
    pernocta, pernoctaVenta,
    extras = []
  } = req.body;

  const datos = [
    proveedor,
    parseDecimal(flete),
    parseDecimal(fleteVenta),
    parseDecimal(estadia),
    parseDecimal(estadiaVenta),
    parseDecimal(burreo),
    parseDecimal(burreoVenta),
    parseDecimal(sobrepeso),
    parseDecimal(sobrepesoVenta),
    parseDecimal(apoyo),
    parseDecimal(apoyoVenta),
    parseDecimal(pernocta),
    parseDecimal(pernoctaVenta)
  ];

  try {
    db.query('SELECT id FROM flete_terrestre_costos WHERE asignacion_id = ?', [asignacionId], (err, resultados) => {
      if (err) return res.status(500).json({ error: 'Error al buscar Flete Terrestre' });

      const callbackFinal = async (idFlete) => {
        try {
          // Guardar los extras PRIMERO
          await new Promise((resolve, reject) => {
            db.query('DELETE FROM extras_flete_terrestre WHERE flete_terrestre_id = ?', [idFlete], (err) => {
              if (err) return reject(err);

              const valores = extras
                .filter(extra => extra.concepto?.trim() !== '' && Number(extra.costo) > 0 && Number(extra.venta) > 0)
                .map(extra => [
                  idFlete,
                  extra.concepto.trim(),
                  parseFloat(extra.costo),
                  parseFloat(extra.venta)
                ]);

              if (valores.length === 0) return resolve();

              db.query(
                'INSERT INTO extras_flete_terrestre (flete_terrestre_id, concepto, costo, venta) VALUES ?',
                [valores],
                (err) => {
                  if (err) return reject(err);
                  resolve();
                }
              );
            });
          });

          // 🔄 Ahora sí, después de guardar todo, actualiza el estado de cuenta
          const [[proceso]] = await db.promise().query(
            'SELECT proceso_operativo_id FROM asignacion_costos WHERE id = ?',
            [asignacionId]
          );

          if (proceso?.proceso_operativo_id) {
            const procesoId = proceso.proceso_operativo_id;
            await insertarOCrearEstadoCuenta(asignacionId, procesoId);
            await sincronizarServiciosEstadoCuenta(asignacionId, procesoId);
            console.log('✅ Estado de cuenta actualizado y servicios sincronizados desde Flete Terrestre');
          } else {
            console.warn('⚠️ No se encontró proceso operativo para esta asignación');
          }

          return res.json({ mensaje: 'Flete terrestre y extras guardados correctamente' });

        } catch (error) {
          console.error('❌ Error al guardar extras o sincronizar estado de cuenta:', error);
          return res.status(500).json({ error: 'Error al guardar flete terrestre' });
        }
      };

      if (resultados.length > 0) {
        const idFlete = resultados[0].id;
        db.query(
          `UPDATE flete_terrestre_costos SET 
            proveedor = ?, flete = ?, flete_venta = ?, 
            estadia = ?, estadia_venta = ?, 
            burreo = ?, burreo_venta = ?, 
            sobrepeso = ?, sobrepeso_venta = ?, 
            apoyo = ?, apoyo_venta = ?, 
            pernocta = ?, pernocta_venta = ?
           WHERE asignacion_id = ?`,
          [...datos, asignacionId],
          (err) => {
            if (err) return res.status(500).json({ error: 'Error al actualizar Flete Terrestre' });
            callbackFinal(idFlete);
          }
        );
      } else {
        db.query(
          `INSERT INTO flete_terrestre_costos 
           (asignacion_id, proveedor, flete, flete_venta, estadia, estadia_venta, burreo, burreo_venta, 
            sobrepeso, sobrepeso_venta, apoyo, apoyo_venta, pernocta, pernocta_venta)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [asignacionId, ...datos],
          (err, result) => {
            if (err) return res.status(500).json({ error: 'Error al guardar Flete Terrestre' });
            const nuevoId = result.insertId;
            callbackFinal(nuevoId);
          }
        );
      }
    });
  } catch (error) {
    console.error('❌ Error inesperado al guardar Flete Terrestre:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const actualizarExtras = (fleteId, extras, res) => {
  db.query('DELETE FROM extras_flete_terrestre WHERE flete_terrestre_id = ?', [fleteId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar extras anteriores' });
    }

    const valores = extras
      .filter(extra => {
        // Solo pasa si tiene concepto no vacío y valores mayores a 0
        return extra.concepto?.trim() !== '' && Number(extra.costo) > 0 && Number(extra.venta) > 0;
      })
      .map(extra => [
        fleteId,
        extra.concepto.trim(),
        parseFloat(extra.costo),
        parseFloat(extra.venta)
      ]);

    if (valores.length === 0) {
      return res.json({ mensaje: 'Flete terrestre actualizado sin extras válidos' });
    }

    db.query(
      'INSERT INTO extras_flete_terrestre (flete_terrestre_id, concepto, costo, venta) VALUES ?',
      [valores],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error al guardar extras' });
        }
        return res.json({ mensaje: 'Flete terrestre y extras guardados correctamente' });
      }
    );
  });
};

const obtenerFleteTerrestre = (req, res) => {
  const asignacionId = req.params.id;
  db.query(
    'SELECT * FROM flete_terrestre_costos WHERE asignacion_id = ?',
    [asignacionId],
    (err, resultados) => {
      if (err) return res.status(500).json({ error: 'Error al obtener flete terrestre' });

      if (resultados.length === 0) {
        return res.status(404).json({ error: 'Flete terrestre no encontrado' });
      }

      const flete = resultados[0];

      db.query(
        'SELECT concepto, costo, venta FROM extras_flete_terrestre WHERE flete_terrestre_id = ?',
        [flete.id],
        (err, extras) => {
          if (err) return res.status(500).json({ error: 'Error al obtener extras' });
          res.json({ ...flete, extras });
        }
      );
    }
  );
};

module.exports = {
  guardarFleteTerrestre,
  obtenerFleteTerrestre
};