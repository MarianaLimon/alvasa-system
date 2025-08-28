const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/usuarios/usuariosController');

// Catálogo de permisos
router.get('/permisos', ctrl.getPermisos);

// Lista de usuarios
router.get('/usuarios', ctrl.getUsuarios);

// Permisos efectivos de un usuario
router.get('/usuarios/:id/permisos-efectivos', ctrl.getPermisosEfectivos);

// Toggle permiso
router.put('/usuarios/:id/permisos', ctrl.togglePermiso);

module.exports = router;
