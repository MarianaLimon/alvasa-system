const path = require('path');
const fs = require('fs');
const db = require('../../config/db');
const puppeteer = require('puppeteer');
const ejs = require('ejs');

// ===== Helpers (idénticos al sencillo) =====
const $money = (n) =>
  (Number(n || 0)).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });

const toDateSafe = (v) => {
  if (!v) return null;
  if (v instanceof Date && !isNaN(v)) return v;
  if (typeof v === 'string') {
    const s = v.trim();
    const m = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
    if (m) {
      const [_, y, mo, d] = m.map(Number);
      return new Date(Date.UTC(y, mo - 1, d));
    }
    const tryD = new Date(s);
    if (!isNaN(tryD)) return tryD;
  }
  try {
    const s = String(v);
    const tryD = new Date(s);
    if (!isNaN(tryD)) return tryD;
  } catch (_) {}
  return null;
};

const $fechaLarga = (v) => {
  const d = toDateSafe(v);
  if (!d) return '—';
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
};

const $fechaCorta = (v) => {
  const d = toDateSafe(v);
  if (!d) return '—';
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
};

const $sum = (arr, k) => arr.reduce((a, it) => a + Number(it?.[k] || 0), 0);

// ===== Logo (igual que sencillo) =====
const logoPath = path.join(__dirname, '../../public/images/alvasa-logo-new.jpg');
const logo = (() => {
  try {
    const buf = fs.readFileSync(logoPath);
    return 'data:image/jpeg;base64,' + buf.toString('base64');
  } catch (err) {
    console.warn('⚠️ No se pudo cargar el logo:', err.message);
    return null;
  }
})();

exports.generarPDFECCFiltrado = async (req, res) => {
  try {
    const { cliente, estatus, desde, hasta, q } = req.query;

    // ---- Filtros sobre ECC (campos reales)
    const where = [];
    const params = [];
    if (cliente) { where.push('ecc.cliente = ?');        params.push(cliente); }
    if (estatus) { where.push('ecc.estatus = ?');        params.push(estatus); }
    if (desde)   { where.push('ecc.fecha_entrega >= ?'); params.push(desde); }
    if (hasta)   { where.push('ecc.fecha_entrega <= ?'); params.push(hasta); }

    if (q && q.trim()) {
      const like = `%${q.trim()}%`;
      where.push(`(
          ecc.cliente LIKE ?
          OR ecc.id_estado_cuenta LIKE ?
          OR ecc.folio_proceso LIKE ?
          OR ecc.contenedor LIKE ?
          OR ecc.tipo_carga LIKE ?
          OR ecc.mercancia LIKE ?
          OR ecc.estatus LIKE ?
      )`);
      params.push(like, like, like, like, like, like, like);
    }

    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // ---- Traer lista base (con ID interno y FOLIO)
    const [listaBase] = await db.promise().query(`
      SELECT
        ecc.id                  AS ecc_id,           -- interno numérico
        ecc.id_estado_cuenta    AS folio,            -- folio string
        ecc.cliente             AS cliente,
        ecc.estatus             AS estatus,
        ecc.contenedor          AS contenedor,
        ecc.tipo_carga          AS tipo_carga,
        ecc.mercancia           AS mercancia,
        ecc.fecha_entrega       AS fecha_entrega
      FROM estado_cuenta_clientes ecc
      ${whereSQL}
      ORDER BY ecc.fecha_entrega DESC, ecc.id DESC
    `, params);

    if (!listaBase || listaBase.length === 0) {
      // Render vacío
      const templatePath = path.join(__dirname, '../../views/ecc-filtrado.ejs');
      const html = await ejs.renderFile(templatePath, {
        filtros: { cliente, estatus, desde, hasta },
        lista: [],
        global: { totalServicios: 0, totalAbonos: 0, saldo: 0 },
        $money, $fechaLarga, $fechaCorta, logo
      }, { async: true });

      const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      const pdf = await page.pdf({ printBackground: true, format: 'A4', margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' } });
      await browser.close();
      res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="ECC-filtrado.pdf"`, 'Content-Length': pdf.length });
      return res.send(pdf);
    }

    // ---- Totales agrupados
    const ids    = listaBase.map(r => r.ecc_id);  // para servicios (numérico)
    const folios = listaBase.map(r => r.folio);   // para abonos (string)

    // Servicios: referencia por ID INTERNO (numérico)
    const [serviciosAgg] = await db.promise().query(`
      SELECT id_estado_cuenta AS ecc_id, COALESCE(SUM(importe),0) AS totalServicios
      FROM servicios_estado_cuenta
      WHERE id_estado_cuenta IN (?)
      GROUP BY id_estado_cuenta
    `, [ids]);

    // Abonos: referencia por FOLIO (string)
    const [abonosAgg] = await db.promise().query(`
      SELECT id_estado_cuenta AS folio, COALESCE(SUM(abono),0) AS totalAbonos
      FROM abonos_estado_cuenta
      WHERE id_estado_cuenta IN (?)
      GROUP BY id_estado_cuenta
    `, [folios]);

    const servMap = new Map(serviciosAgg.map(r => [Number(r.ecc_id), Number(r.totalServicios || 0)]));
    const abonMap = new Map(abonosAgg.map(r => [String(r.folio), Number(r.totalAbonos || 0)]));

    const lista = listaBase.map(r => {
      const totalServicios = servMap.get(Number(r.ecc_id)) || 0;
      const totalAbonos    = abonMap.get(String(r.folio))   || 0;
      const saldo          = totalServicios - totalAbonos;
      // puedes usar el estatus de ECC o derivarlo del saldo; dejo el de ECC si existe, si no derivado:
      const estatusFinal   = r.estatus || (saldo <= 0 ? 'Pagado' : 'Pendiente');
      return { ...r, totalServicios, totalAbonos, saldo, estatus: estatusFinal };
    });

    // ---- Totales globales
    const global = {
      totalServicios: $sum(lista, 'totalServicios'),
      totalAbonos:    $sum(lista, 'totalAbonos'),
      saldo:          $sum(lista, 'saldo'),
    };

    // ---- Render
    const templatePath = path.join(__dirname, '../../views/ecc-filtrado.ejs');
    const html = await ejs.renderFile(templatePath, {
      filtros: { cliente, estatus, desde, hasta },
      lista,
      global,
      $money, $fechaLarga, $fechaCorta, logo
    }, { async: true });

    // ---- PDF
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const pdf = await page.pdf({
      printBackground: true,
      format: 'A4',
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
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
