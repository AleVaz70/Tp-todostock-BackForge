const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventario.controller');

router.get('/', inventarioController.resumen);
router.post('/lotes', inventarioController.ingresarLote);
router.get('/alertas', inventarioController.alertas);
router.get('/producto/:productoId', inventarioController.stockProducto);

module.exports = router;