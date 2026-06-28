const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compra.controller');

router.get('/', compraController.listar);
router.get('/:id', compraController.obtener);
router.post('/', compraController.crear);
router.patch('/:id/aprobar', compraController.aprobar);
router.patch('/:id/recibir', compraController.recibir);

module.exports = router;