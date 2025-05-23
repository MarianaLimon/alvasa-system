const db = require('../config/db');

const obtenerDatosDelProceso = (id) => {
  return new Promise((resolve, reject) => {
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
      if (err || resultProceso.length === 0) return reject('Proceso no encontrado');

      const proceso = resultProceso[0];
      const datosCompletos = { ...proceso };

      let consultasCompletadas = 0;
      const totalConsultas = Object.keys(consultasSubformularios).length;

      for (const [clave, query] of Object.entries(consultasSubformularios)) {
        db.query(query, [id], (error, subResult) => {
          datosCompletos[clave] = subResult[0] || {};
          consultasCompletadas++;
          if (consultasCompletadas === totalConsultas) {
            resolve(datosCompletos);
          }
        });
      }
    });
  });
};

module.exports = obtenerDatosDelProceso;