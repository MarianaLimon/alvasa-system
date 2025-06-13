const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const axios = require('axios');

// Función auxiliar para formato moneda
function formatoMoneda(n) {
  if (!n) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n);
}

// Leer y codificar el logo
const logoPath = path.join(__dirname, '../../public/images/alvasa-logo-new.jpg');
const logoData = (() => {
  try {
    const img = fs.readFileSync(logoPath);
    return 'data:image/jpeg;base64,' + img.toString('base64');
  } catch (err) {
    console.warn('⚠️ No se pudo cargar el logo:', err);
    return null;
  }
})();

// Controlador principal
exports.generarPdfAsignacion = async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener la asignación completa del backend (como la ves en la vista)
    const { data: asignacion } = await axios.get(`http://localhost:5050/asignacion-costos/${id}`);
    if (!asignacion || !asignacion.folio_proceso) {
    return res.status(404).send('Asignación no encontrada');
    }

    const folio = asignacion.folio_proceso;

    const { data: asignacionCompleta } = await axios.get(`http://localhost:5050/asignacion-costos/completo/${folio}`);

    // Renderizar EJS
    const html = await ejs.renderFile(
        path.join(__dirname, '../../views/asignacion.ejs'),
        { asignacion: asignacionCompleta, formatoMoneda, logo: logoData }
    );

    // Generar PDF
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
    });

    await browser.close();

    // Enviar el PDF
    res
      .set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="asignacion-${asignacion.folio_proceso}.pdf"`
      })
      .send(buffer);

  } catch (error) {
    console.error('❌ Error al generar PDF de asignación:', error);
    res.status(500).send('Error al generar PDF');
  }
};
