const express = require('express');
const router = express.Router();
const Cliente = require('../models/Cliente'); 

// GET /api/cuentas - Obtiene el resumen de cuentas corrientes de los clientes
router.get('/', async (req, res, next) => {
  try {
    // Buscamos los clientes ordenados alfabéticamente trayendo nombre, cuit, saldo y limite
    const cuentas = await Cliente.find({}, 'nombre cuit saldo limiteCredito activo').sort({ nombre: 1 });
    res.json(cuentas);
  } catch (error) {
    next(error);
  }
});

// GET /api/cuentas/:clienteId - Obtiene el estado de cuenta específico de un cliente
router.get('/:clienteId', async (req, res, next) => {
  try {
    const cliente = await Cliente.findById(req.params.clienteId, 'nombre cuit saldo limiteCredito activo');
    if (!cliente) {
      return res.status(404).json({ error: 'Cuenta de cliente no encontrada' });
    }
    res.json(cliente);
  } catch (error) {
    next(error);
  }
});

module.exports = router;