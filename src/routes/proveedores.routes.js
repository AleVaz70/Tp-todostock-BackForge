const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedor.controller');

// Definición de rutas apuntando al controlador de MongoDB
router.get('/', proveedorController.listar);
router.get('/:id', proveedorController.obtener);
router.post('/', proveedorController.crear);
router.put('/:id', proveedorController.actualizar);
router.patch('/:id/bloquear', proveedorController.bloquear);
router.patch('/:id/desbloquear', proveedorController.desbloquear);

module.exports = router;
