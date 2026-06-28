const express = require('express');
const router = express.Router();
const { protegerRuta } = require('../middlewares/auth.middleware');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Proveedor = require('../models/Proveedor');
const Pedido = require('../models/Pedido');
const OrdenCompra = require('../models/OrdenCompra'); 
const Lote = require('../models/Lote');
const productoController = require('../controllers/producto.controller');
const ventaController = require('../controllers/venta.controller');

// ─── RUTAS PÚBLICAS ────────────────────────────────────────────────────────
router.get('/login', (req, res) => { res.render('login'); });
router.get('/registrar', (req, res) => { res.render('registrar'); });

/// ─── DASHBOARD DE INICIO INTELIGENTE CON ALERTA TOTAL CONSOLIDADA ──────────
router.get('/inicio', protegerRuta, async (req, res, next) => {
  try {
    const [todosLosProductos, proveedores, lotes] = await Promise.all([
      Producto.find().sort({ nombre: 1 }),
      Proveedor.find(),
      Lote.find()
    ]);

    // 1. Calculamos el stock consolidado real sumando todas las partidas físicas
    const stockPorProducto = {};
    lotes.forEach(lote => {
      if (!lote.productoId) return; 
      const prodId = lote.productoId.toString();
      stockPorProducto[prodId] = (stockPorProducto[prodId] || 0) + (lote.cantidadActual || 0);
    });

    // 2. Filtramos comparando el stock consolidado total contra el mínimo exigido
    const productosBajos = [];
    
    todosLosProductos.forEach(prod => {
      const stockRealTotal = stockPorProducto[prod._id.toString()] || 0;
      
      if (stockRealTotal < prod.stockMinimo) {
        const proveedorAsignado = prod.categoria === 'Desinfectantes' ? proveedores[0] : proveedores[1];
        
        productosBajos.push({
          nombre: prod.nombre,
          stockMinimo: prod.stockMinimo,
          stockActual: stockRealTotal,
          proveedorNombre: proveedorAsignado ? proveedorAsignado.nombre : 'Proveedor General'
        });
      }
    });

    // 🚀 BLINDAJE BI-DIRECCIONAL DE ROLES PARA PUG
    if (req.usuario) {
      req.usuario.role = req.usuario.role || req.usuario.rol;
      req.usuario.rol = req.usuario.role;
    }

    res.render('inicio', {
      title: 'Inicio',
      titulo: 'Panel de Control Principal',
      usuario: req.usuario, // Ahora viaja con rol y role unificados
      productosBajos 
    });
  } catch (error) {
    next(error);
  }
});

router.get('/productos', protegerRuta, productoController.listarProductosVista);

// ─── SECTOR CLIENTES (ORGANIZADO EN ORDEN) ───────────────────────────────

router.get('/clientes', protegerRuta, async (req, res, next) => {
  try {
    const clientes = await Cliente.find().sort({ nombre: 1 });
    
    res.render('clientes/index', { 
      title: 'Clientes', 
      titulo: 'Clientes', 
      clientes,
      usuario: req.usuario
    });
  } catch (error) {
    next(error);
  }
});

router.get('/clientes/:id/historial', protegerRuta, async (req, res, next) => {
  try {
    const clienteId = req.params.id;

    const [cliente, historialPedidos] = await Promise.all([
      Cliente.findById(clienteId),
      Pedido.find({ clienteId })
        .populate({
          path: 'items.productoId',
          model: 'Producto',
          select: 'nombre codigoSKU unidad'
        })
        .sort({ createdAt: -1 })
    ]);

    if (!cliente) {
      return res.status(404).send('Cliente no encontrado en el sistema maestro.');
    }

    res.render('clientes/historial', {
      title: 'Clientes',
      titulo: `Historial Comercial: ${cliente.nombre}`,
      cliente,
      pedidos: historialPedidos,
      usuario: req.usuario
    });
  } catch (error) {
    next(error);
  }
});


// ─── SECTOR VENTAS  ──────────────────────────

router.get('/ventas', protegerRuta, async (req, res, next) => {
  try {
    const [pedidos, clientes, productos] = await Promise.all([
      Pedido.find().populate('clienteId', 'nombre cuit').sort({ createdAt: -1 }),
      Cliente.find({ activo: { $ne: false } }).sort({ nombre: 1 }),
      Producto.find().sort({ nombre: 1 })
    ]);
    
    res.render('ventas/index', { 
      title: 'Ventas', 
      titulo: 'Ventas y Despachos', 
      pedidos,
      clientes,   
      productos,  
      usuario: req.usuario
    });
  } catch (error) {
    next(error);
  }
});

router.get('/compras', protegerRuta, async (req, res, next) => {
  try {
    const ordenes = await OrdenCompra.find()
      .populate('proveedorId', 'nombre cuit')
      .populate({
        path: 'items.productoId', // ← Le decimos la ruta exacta dentro del array
        model: 'Producto',        // ← Forzamos que busque en el modelo Producto
        select: 'nombre codigoSKU' // ← Traemos solo los datos esenciales
      })
      .sort({ createdAt: -1 });

    const proveedores = await Proveedor.find({ activo: { $ne: false } }).sort({ nombre: 1 });
    const productos = await Producto.find().sort({ nombre: 1 });
    
    res.render('compras/index', { 
      title: 'Órdenes de Compra',            
      titulo: 'Órdenes de Compra',   
      ordenes: ordenes, 
      proveedores: proveedores, 
      productos: productos,
      usuario: req.usuario
    });
  } catch (error) {
    next(error);
  }
});

// 🖥️ Interfaz gráfica de Stock e Inventario (http://localhost:3000/inventario) 
router.get('/inventario', protegerRuta, async (req, res, next) => {
  try {
    // Traemos lotes (con sus relaciones), productos y proveedores en paralelo
    const [lotes, productos, proveedores] = await Promise.all([
      Lote.find().populate('productoId').populate('proveedorId').sort({ fechaVencimiento: 1 }),
      Producto.find().sort({ nombre: 1 }),
      Proveedor.find({ activo: { $ne: false } }).sort({ nombre: 1 })
    ]);

    // Calculamos el stock consolidado total por cada producto (Sumando todos sus lotes)
    const stockConsolidadoPorProducto = {};
    lotes.forEach(lote => {
      if (!lote.productoId) return;
      const prodId = lote.productoId._id.toString();
      stockConsolidadoPorProducto[prodId] = (stockConsolidadoPorProducto[prodId] || 0) + (lote.cantidadActual || 0);
    });

    // Procesamos cada lote inyectándole la regla de alerta antes de ir a Pug
    const lotesProcesados = lotes.map(lote => {
      const objetoLote = lote.toObject();
      
      if (objetoLote.productoId) {
        const prodId = objetoLote.productoId._id.toString();
        const stockRealTotalDistribuidora = stockConsolidadoPorProducto[prodId] || 0;
        
        // Alerta si el stock consolidado cae por debajo del mínimo, pero solo en lotes activos
        objetoLote.requiereAlerta = (stockRealTotalDistribuidora < objetoLote.productoId.stockMinimo) && (objetoLote.cantidadActual > 0);
      } else {
        objetoLote.requiereAlerta = false;
      }
      
      return objetoLote;
    });

    // Renderizamos pasando todas las variables que la vista Pug necesita usar
    res.render('inventario/index', { 
      title: 'Stock y Alertas', 
      titulo: 'Stock y Alertas', 
      lotes: lotesProcesados, 
      productos,
      proveedores, 
      usuario: req.usuario
    });
  } catch (error) {
    next(error);
  }
});

// ─── SECTOR PROVEEDORES & DOSSIER LOGÍSTICO ──────────────────────────────

router.get('/proveedores', protegerRuta, async (req, res, next) => {
  try {
    const proveedores = await Proveedor.find().sort({ nombre: 1 });
    
    res.render('proveedores/index', {
      title: 'Proveedores',
      titulo: 'Panel de Proveedores Homologados',
      proveedores,
      usuario: req.usuario
    });
  } catch (error) {
    next(error);
  }
});

// NUEVO ENDPOINT: Ficha Histórica de Órdenes de Compra por Proveedor
router.get('/proveedores/:id/historial', protegerRuta, async (req, res, next) => {
  try {
    const proveedorId = req.params.id;

    const [proveedor, ordenesCompra] = await Promise.all([
      Proveedor.findById(proveedorId),
      OrdenCompra.find({ proveedorId })
        .populate({
          path: 'items.productoId',
          model: 'Producto',
          select: 'nombre codigoSKU'
        })
        .sort({ createdAt: -1 })
    ]);

    if (!proveedor) {
      return res.status(404).send('Proveedor no registrado en el catálogo corporativo.');
    }

    res.render('proveedores/historial', {
      title: 'Proveedores',
      titulo: `Dossier Suministros: ${proveedor.nombre}`,
      proveedor,
      ordenes: ordenesCompra,
      usuario: req.usuario
    });
  } catch (error) {
    next(error);
  }
});
// ─── APIs COMPLETAS PARA EL PANEL DE CLIENTES MAYORISTAS ──────────────────

// A. Ruta para registrar un nuevo cliente (POST)
router.post('/clientes', protegerRuta, async (req, res, next) => {
  try {
    const { nombre, cuit, limiteCredito, diasPlazo } = req.body;
    const nuevoCliente = new Cliente({
      nombre,
      cuit,
      limiteCredito: parseFloat(limiteCredito) || 0,
      diasPlazo: parseInt(diasPlazo) || 0,
      saldo: 0,
      activo: true
    });
    await nuevoCliente.save();
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// B. Ruta para modificar el límite de crédito (PUT)
router.put('/clientes/:id', protegerRuta, async (req, res, next) => {
  try {
    const { limiteCredito } = req.body;
    await Cliente.findByIdAndUpdate(req.params.id, { 
      limiteCredito: parseFloat(limiteCredito) || 0 
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// C. Ruta crítica: Registrar Cobro/Pago directo en la base de datos
router.patch('/clientes/:id/pago', protegerRuta, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { monto } = req.body; // El monto que pusiste en el cartel (prompt)

    const cliente = await Cliente.findById(id);
    if (!cliente) {
      return res.status(404).json({ success: false, error: 'Cliente no encontrado.' });
    }

    // Validación de seguridad 
    if (parseFloat(monto) > cliente.saldo) {
      return res.status(400).json({ success: false, error: 'El abono no puede ser superior al saldo deudor actual.' });
    }

    // Restamos el abono al saldo actual
    cliente.saldo = (cliente.saldo || 0) - parseFloat(monto);
    await cliente.save();

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// D. Rutas para bloquear / desbloquear clientes (PATCH)
router.patch('/clientes/:id/bloquear', protegerRuta, async (req, res, next) => {
  try {
    await Cliente.findByIdAndUpdate(req.params.id, { activo: false });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/clientes/:id/desbloquear', protegerRuta, async (req, res, next) => {
  try {
    await Cliente.findByIdAndUpdate(req.params.id, { activo: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── ENLACES OPERATIVOS PARA EL MÓDULO DE VENTAS Y LOGÍSTICA FEFO ────────

// 1. Ruta para crear un nuevo pedido desde la web (POST)
router.post('/ventas', protegerRuta, ventaController.crear);

// 2. Ruta para ejecutar el despacho por lotes FEFO (POST)
router.post('/ventas/:id/despachar', protegerRuta, ventaController.despachar);

// ─── API DE MODIFICACIÓN DE PRECIOS DE PRODUCTOS ──────────────────────────
router.put('/api/productos/:id', protegerRuta, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { precio } = req.body;

    // Actualizamos el precio base del producto en la base de datos distribuida
    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      { precio: parseFloat(precio) || 0 },
      { new: true }
    );

    if (!productoActualizado) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado.' });
    }

    // Respondemos con estado 200 JSON limpio para que el fetch del frontend lance el alert() de éxito
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
module.exports = router;