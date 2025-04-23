const express = require('express');
const router = express.Router();
const costosAdicionalesController = require('../controllers/costosAdicionalesController');

router.get('/', costosAdicionalesController.getCostosAdicionales);
router.post('/', costosAdicionalesController.createCostoAdicional);
router.put('/:id', costosAdicionalesController.updateCostoAdicional);
router.delete('/:id', costosAdicionalesController.deleteCostoAdicional);

module.exports = router;