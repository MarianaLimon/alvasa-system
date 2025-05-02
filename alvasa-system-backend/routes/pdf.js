const express = require('express');
const router  = express.Router();
const pdfCtrl = require('../controllers/pdfController');

// GET /cotizaciones/:id/pdf → genera y descarga el PDF
router.get('/cotizaciones/:id/pdf', pdfCtrl.generarPdf);

module.exports = router;