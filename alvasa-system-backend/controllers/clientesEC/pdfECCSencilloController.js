const path = require('path');
const fs = require('fs');
const db = require('../../config/db');
const puppeteer = require('puppeteer');
const ejs = require('ejs');

// ===== Helpers =====
const $money = (n) =>
  (Number(n || 0)).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });

// Helpers de fecha robustos
const toDateSafe = (v) => {
  if (!v) return null;
  if (v instanceof Date && !isNaN(v)) return v;

  // Si viene como 'YYYY-MM-DD'
  if (typeof v === 'string') {
    const s = v.trim();
    const m = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
    if (m) {
      const [_, y, mo, d] = m.map(Number);
      // usar UTC para evitar desfases por zona
      return new Date(Date.UTC(y, mo - 1, d));
    }
    // último intento: new Date(string)
    const tryD = new Date(s);
    if (!isNaN(tryD)) return tryD;
  }

  // Si viene como objeto tipo RowDataPacket con toString
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

// ===== Logo (igual que en tus otros PDFs) =====
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

// ===== Queries =====
async function getEncabezado(folio) {
  const [[row]] = await db.promise().query(`
    SELECT
      ecc.id_estado_cuenta  AS folio,
      ecc.id                AS ecc_interno,
      ecc.cliente_id        AS cliente_id,
      ecc.cliente           AS cliente,
      ecc.contenedor        AS no_contenedor,
      ecc.tipo_carga        AS tipo_carga,
      ecc.mercancia         AS mercancia,
      ecc.fecha_entrega     AS fecha_entrega
    FROM estado_cuenta_clientes ecc
    WHERE ecc.id_estado_cuenta = ?
    LIMIT 1
  `, [folio]);
  return row || null;
}

async function getServicios(folio) {
  // servicios_estado_cuenta.id_estado_cuenta = ID interno del ECC (numérico)
  const [[ecc]] = await db.promise().query(
    `SELECT id FROM estado_cuenta_clientes WHERE id_estado_cuenta = ? LIMIT 1`, [folio]
  );
  if (!ecc) return [];
  const [rows] = await db.promise().query(`
    SELECT giro, servicio, importe
    FROM servicios_estado_cuenta
    WHERE id_estado_cuenta = ?
    ORDER BY giro, servicio
  `, [ecc.id]);
  return rows;
}

async function getAbonos(folio) {
  // abonos_estado_cuenta usa folio string en id_estado_cuenta
  const [rows] = await db.promise().query(`
    SELECT 
      id_estado_cuenta AS folio,
      abono,
      fecha_pago,
      tipo_transaccion
    FROM abonos_estado_cuenta
    WHERE id_estado_cuenta = ?
    ORDER BY fecha_pago ASC
  `, [folio]);
  return rows;
}

// ===== Controller =====
exports.generarPDFECCSencillo = async (req, res) => {
  const { folio } = req.params;

  try {
    const enc = await getEncabezado(folio);
    if (!enc) return res.status(404).json({ error: `No existe el estado de cuenta ${folio}` });

    const [servicios, abonos] = await Promise.all([ getServicios(folio), getAbonos(folio) ]);

    const totalServicios = $sum(servicios, 'importe');
    const totalAbonos    = $sum(abonos, 'abono');
    const saldo          = totalServicios - totalAbonos;
    const estatus = saldo <= 0 ? 'Pagado' : 'Pendiente';

    const templatePath = path.join(__dirname, '../../views/ecc-sencillo.ejs'); // ← tu ruta
    const html = await ejs.renderFile(templatePath, {
      enc, servicios, abonos, totalServicios, totalAbonos, saldo, estatus,
      $money, $fechaLarga, $fechaCorta, logo
    }, { async: true });

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox','--disable-setuid-sandbox']
    });
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
      'Content-Disposition': `inline; filename="ECC-${folio}.pdf"`,
      'Content-Length': pdf.length
    });
    return res.send(pdf);

  } catch (err) {
    console.error('❌ Error al generar PDF ECC sencillo:', err);
    return res.status(500).json({ error: 'Error al generar el PDF sencillo.' });
  }
};
