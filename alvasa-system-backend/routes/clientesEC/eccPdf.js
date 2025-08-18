const express = require('express');
const router = express.Router();

const { generarPDFECCSencillo } = require('../../controllers/clientesEC/pdfECCSencilloController');
const { generarPDFECCFiltrado } = require('../../controllers/clientesEC/pdfECCFiltradoController');

// PDF sencillo (por folio)
router.get('/estado-cuenta/pdf/sencillo/:folio', generarPDFECCSencillo);

// PDF filtrado (usa query params de la lista)
router.get('/estado-cuenta/pdf/filtrado', generarPDFECCFiltrado);

module.exports = router;
