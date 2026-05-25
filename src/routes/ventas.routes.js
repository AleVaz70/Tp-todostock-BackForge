const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/venta.controller');

router.get('/', ventaController.listar);
router.get('/:id', ventaController.obtener);
router.post('/', ventaController.crear);
router.patch('/:id/despachar', ventaController.despachar);
router.patch('/:id/cancelar', ventaController.cancelar);

module.exports = router;