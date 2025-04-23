const express = require('express');
const router = express.Router();
const itemsCotizacionController = require('../controllers/itemsCotizacionController');

router.get('/', itemsCotizacionController.getItemsCotizacion);
router.post('/', itemsCotizacionController.createItemCotizacion);
router.put('/:id', itemsCotizacionController.updateItemCotizacion);
router.delete('/:id', itemsCotizacionController.deleteItemCotizacion);

module.exports = router;