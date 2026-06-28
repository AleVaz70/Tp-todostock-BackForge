const express = require('express');
const router = express.Router();

// Importamos los middlewares de seguridad que creamos
const { protegerRuta, permitirRoles } = require('../middlewares/auth.middleware');

// Importamos el controlador de ventas en singular
const ventaController = require('../controllers/venta.controller');

// ─── ENDPOINTS DE LA API DE VENTAS ─────────────────────────────────────────────

// CUALQUIER usuario logueado (Admin, Vendedor o Depósito) puede listar o ver una venta
router.get('/', protegerRuta, ventaController.listar);
router.get('/:id', protegerRuta, ventaController.obtener);

// Solo el sector Comercial (Vendedor) o la Gerencia (Administrador) pueden registrar ventas
// (Aquí se evalúa la regla de negocio del Límite de Crédito de la Cuenta Corriente)
router.post('/', protegerRuta, permitirRoles('Administrador', 'Vendedor'), ventaController.crear);

// NUEVA RUTA ENLAZADA AL BOTÓN: Despachar pedido con algoritmo FEFO
// Solo la gente de Depósito (Logística) o la Gerencia (Admin) pueden dar salida a la mercadería
router.post('/:id/despachar', protegerRuta, permitirRoles('Administrador', 'Deposito'), ventaController.despachar);

// Solo el personal del Depósito o el Administrador pueden ejecutar el despacho físico
// (Aquí adentro corre el algoritmo inteligente de rotación de stock FEFO)
router.patch('/:id/despachar', protegerRuta, permitirRoles('Administrador', 'Deposito'), ventaController.despachar);

// Cancelar una orden de venta devuelve el stock de los lotes y limpia saldos deudores
router.patch('/:id/cancelar', protegerRuta, permitirRoles('Administrador', 'Vendedor'), ventaController.cancelar);

module.exports = router;