const path      = require('path');
const fs        = require('fs');
const ejs       = require('ejs');
const puppeteer = require('puppeteer');
const axios     = require('axios');

// Formatea fecha como DD/MM/YYYY
function formatoFecha(date) {
  const f = new Date(date);
  return `${f.getDate()}/${f.getMonth() + 1}/${f.getFullYear()}`;
}

// Formatea número como moneda MXN
function formatoMoney(n) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(n);
}

// Leer y codificar el logo en base64
const logoPath = path.join(__dirname, '../public/images/alvasa-logo-new.jpg');
const logoData = (() => {
  try {
    const img = fs.readFileSync(logoPath);
    return 'data:image/jpeg;base64,' + img.toString('base64');
  } catch {
    return null;
  }
})();

exports.generarPdf = async (req, res) => {
  const { id } = req.params;

  try {
    // 1) Obtener la cotización exactamente igual que tu UI
    const { data: cotizacion } = await axios.get(`http://localhost:5050/cotizaciones/${id}`);
    if (!cotizacion || !cotizacion.id) {
      return res.status(404).send('Cotización no encontrada');
    }

    // 2) Renderizar la plantilla EJS con los mismos datos + logo
    const html = await ejs.renderFile(
      path.join(__dirname, '../views/cotizacion.ejs'),
      { cotizacion, formatoFecha, formatoMoney, logo: logoData }
    );

    // 3) Generar PDF con Puppeteer
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page    = await browser.newPage();
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      url: 'http://localhost:5050' // para recursos relativos si hiciera falta
    });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' }
    });
    await browser.close();

    // 4) Enviar PDF al cliente
    res
      .set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="cotizacion-${cotizacion.folio}.pdf"`
      })
      .send(pdfBuffer);

  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).send('Error al generar PDF');
  }
};