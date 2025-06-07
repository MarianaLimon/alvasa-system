const db = require('../../config/db');

// Función para convertir vacío en 0
const parseDecimal = (val) => val === '' || val === undefined || val === null ? 0 : parseFloat(val);

// Guardar o actualizar Flete Terrestre
const guardarFleteTerrestre = async (req, res) => {
    console.log('📦 Datos recibidos para guardar flete terrestre:', req.body);
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

  console.log('📦 Datos recibidos para guardar flete terrestre:', req.body);

  try {
    // Verifica si ya existe un registro para esa asignación
    db.query('SELECT id FROM flete_terrestre_costos WHERE asignacion_id = ?', [asignacionId], (err, resultados) => {
      if (err) return res.status(500).json({ error: 'Error al buscar Flete Terrestre' });

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

      if (resultados.length > 0) {
        // Ya existe → actualizar
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
            actualizarExtras(idFlete, extras, res);
          }
        );
      } else {
        // No existe → insertar

        console.log('🧪 Insertando flete terrestre con:', [asignacionId, ...datos]);
        db.query(
          `INSERT INTO flete_terrestre_costos 
           (asignacion_id, proveedor, flete, flete_venta, estadia, estadia_venta, burreo, burreo_venta, 
            sobrepeso, sobrepeso_venta, apoyo, apoyo_venta, pernocta, pernocta_venta)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [asignacionId, ...datos],
          (err, result) => {
            if (err) return res.status(500).json({ error: 'Error al guardar Flete Terrestre' });

            const nuevoId = result.insertId;

            console.log('Extras a guardar:', extras);
            actualizarExtras(nuevoId, extras, res);
          }
        );
      }
    });
  } catch (error) {
    console.error('Error al guardar Flete Terrestre:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Función auxiliar para actualizar los extras
const actualizarExtras = (fleteId, extras, res) => {

    console.log('🧩 ID de flete recibido para extras:', fleteId);
    
  db.query('DELETE FROM extras_flete_terrestre WHERE flete_terrestre_id = ?', [fleteId], (err) => {
    if (err) {
      console.error('Error al eliminar extras:', err);
      return res.status(500).json({ error: 'Error al eliminar extras anteriores' });
    }

    if (!extras || extras.length === 0) {
      return res.json({ mensaje: 'Flete terrestre actualizado sin extras' });
    }

    const valores = extras
      .filter(extra => extra.concepto || extra.costo || extra.venta) // solo si tienen contenido
      .map(extra => [fleteId, extra.concepto, parseDecimal(extra.costo), parseDecimal(extra.venta)]);

    console.log('Insertando estos extras:', valores);

    if (valores.length === 0) {
      return res.json({ mensaje: 'Flete terrestre actualizado, sin extras válidos' });
    }

    db.query(
      'INSERT INTO extras_flete_terrestre (flete_terrestre_id, concepto, costo, venta) VALUES ?',
      [valores],
      (err) => {
        if (err) {
          console.error('Error al insertar extras:', err);
          return res.status(500).json({ error: 'Error al guardar extras' });
        }
        return res.json({ mensaje: 'Flete terrestre y extras guardados correctamente' });
      }
    );
  });
};

// Obtener Flete Terrestre por asignación
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