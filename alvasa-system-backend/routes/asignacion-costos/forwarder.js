const express = require('express');
const router = express.Router();
const forwarderController = require('../../controllers/asignacion-costos/forwarderController');

router.post('/:asignacionId', forwarderController.guardarForwarder);
router.get('/:asignacionId', forwarderController.obtenerForwarder);

module.exports = router;