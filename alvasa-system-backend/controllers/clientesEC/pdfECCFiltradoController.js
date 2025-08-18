const path = require('path');
const db = require('../../config/db');
const puppeteer = require('puppeteer');
const ejs = require('ejs');

const $money = (n) => (Number(n || 0)).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
const $fechaCorta = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Para totales por ECC
async function getServiciosPorFolio(folio) {
  const [rows] = await db.promise().query(`
    SELECT importe FROM servicios_estado_cuenta WHERE id_estado_cuenta = ?
  `, [folio]);
  return rows.reduce((a, r) => a + Number(r.importe || 0), 0);
}
async function getAbonosPorFolio(folio) {
  const [rows] = await db.promise().query(`
    SELECT abono FROM abonos_estado_cuenta WHERE numero_estado_cuenta = ?
  `, [folio]);
  return rows.reduce((a, r) => a + Number(r.abono || 0), 0);
}

exports.generarPDFECCFiltrado = async (req, res) => {
  try {
    // Filtros esperados (ajusta nombres según tu frontend):
    const { cliente, desde, hasta, contenedor, tipo_carga } = req.query;

    // Base query
    const where = [];
    const params = [];

    // Filtro por cliente (nombre contiene)
    if (cliente) {
      where.push('c.nombre LIKE ?');
      params.push(`%${cliente}%`);
    }
    // Fecha (usamos src.entrega como fecha de referencia del ECC)
    if (desde) {
      where.push('src.entrega >= ?');
      params.push(desde);
    }
    if (hasta) {
      where.push('src.entrega <= ?');
      params.push(hasta);
    }
    // Contenedor exacto (si lo usas)
    if (contenedor) {
      where.push('po.no_contenedor = ?');
      params.push(contenedor);
    }
    // Tipo de carga (exacto)
    if (tipo_carga) {
      where.push('po.tipo_carga = ?');
      params.push(tipo_carga);
    }

    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // Traemos la lista de ECC que cumplen el filtro
    const [lista] = await db.promise().query(`
      SELECT
        ecc.id_estado_cuenta  AS folio,
        c.nombre              AS cliente,
        po.no_contenedor      AS no_contenedor,
        po.tipo_carga         AS tipo_carga,
        po.mercancia          AS mercancia,
        src.entrega           AS fecha_entrega
      FROM estado_cuenta_clientes ecc
      LEFT JOIN clientes c ON c.id = ecc.cliente_id
      LEFT JOIN procesos_operativos po ON po.id = ecc.id_proceso_operativo
      LEFT JOIN salida_retorno_contenedor src ON src.proceso_operativo_id = po.id
      ${whereSQL}
      ORDER BY src.entrega DESC, ecc.id DESC
    `, params);

    // Calculamos totales por cada ECC
    for (const it of lista) {
      const totalServicios = await getServiciosPorFolio(it.folio);
      const totalAbonos = await getAbonosPorFolio(it.folio);
      it.totalServicios = totalServicios;
      it.totalAbonos = totalAbonos;
      it.saldo = totalServicios - totalAbonos;
    }

    // Acumulados globales
    const sum = (arr, k) => arr.reduce((a, it) => a + Number(it[k] || 0), 0);
    const global = {
      totalServicios: sum(lista, 'totalServicios'),
      totalAbonos: sum(lista, 'totalAbonos'),
      saldo: sum(lista, 'saldo')
    };

    // Render EJS
    const templatePath = path.join(__dirname, '../../views/ecc-filtrado.ejs');
    const html = await ejs.renderFile(templatePath, {
      filtros: { cliente, desde, hasta, contenedor, tipo_carga },
      lista,
      global,
      $money, $fechaCorta
    }, { async: true });

    // PDF
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const pdf = await page.pdf({
      printBackground: true, format: 'A4',
      margin: { top: '12mm', right: '10mm', bottom: '12mm', left: '10mm' }
    });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="ECC-filtrado.pdf"`,
      'Content-Length': pdf.length
    });
    return res.send(pdf);

  } catch (err) {
    console.error('❌ Error al generar PDF ECC filtrado:', err);
    return res.status(500).json({ error: 'Error al generar el PDF filtrado.' });
  }
};
