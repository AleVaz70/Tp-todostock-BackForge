const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Proveedor = require('../models/Proveedor');
const Pedido = require('../models/Pedido');
const OrdenCompra = require('../models/OrdenCompra'); 
const Lote = require('../models/Lote');

// 🖥️ Interfaz gráfica de Productos (http://localhost:3000/productos)
router.get('/productos', async (req, res, next) => {
  try {
    const productos = await Producto.find().sort({ nombre: 1 });
    res.render('productos/index', { title: 'Productos', titulo: 'Productos', productos });
  } catch (error) {
    next(error);
  }
});

// 🖥️ Interfaz gráfica de Clientes (http://localhost:3000/clientes)
router.get('/clientes', async (req, res, next) => {
  try {
    const clientes = await Cliente.find().sort({ nombre: 1 });
    res.render('clientes/index', { title: 'Clientes', titulo: 'Clientes', clientes });
  } catch (error) {
    next(error);
  }
});

// 🖥️ Interfaz gráfica de Ventas/Pedidos (http://localhost:3000/ventas)
router.get('/ventas', async (req, res, next) => {
  try {
    const pedidos = await Pedido.find()
      .populate('clienteId', 'nombre cuit')
      .sort({ createdAt: -1 });
    res.render('ventas/index', { title: 'Ventas', titulo: 'Ventas', pedidos });
  } catch (error) {
    next(error);
  }
});

// 🖥️ Interfaz gráfica de Órdenes de Compra (http://localhost:3000/compras)
router.get('/compras', async (req, res, next) => {
  try {
    // Buscamos las órdenes en MongoDB y traemos el nombre del proveedor relacionado
    const compras = await OrdenCompra.find()
      .populate('proveedorId', 'nombre')
      .sort({ createdAt: -1 });
    res.render('compras/index', { title: 'Compras', titulo: 'Órdenes de Compra', compras });
  } catch (error) {
    next(error);
  }
});

// 🖥️ Interfaz gráfica de Stock y Alertas (http://localhost:3000/inventario)
router.get('/inventario', async (req, res, next) => {
  try {
    // Traemos los lotes de stock físico vigentes emparejados con el nombre del producto
    const lotes = await Lote.find()
      .populate('productoId', 'nombre')
      .sort({ fechaVencimiento: 1 }); // Ordenados por FEFO para ver los vencimientos arriba
    res.render('inventario/index', { title: 'Inventario', titulo: 'Stock y Alertas', lotes });
  } catch (error) {
    next(error);
  }
});

router.get('/proveedores', async (req, res, next) => {
  try {
    const proveedores = await Proveedor.find().sort({ nombre: 1 });
    res.render('proveedores/index', {
      titulo: 'Panel de Proveedores Homologados',
      proveedores
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;