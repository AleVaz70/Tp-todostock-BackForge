const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');

router.get('/', clienteController.listar);
router.get('/:id', clienteController.obtener);
router.post('/', clienteController.crear);
router.put('/:id', clienteController.actualizar);
router.patch('/:id/bloquear', clienteController.bloquear);
router.patch('/:id/desbloquear', clienteController.desbloquear);
router.patch('/:id/pago', clienteController.registrarPago);

module.exports = router;