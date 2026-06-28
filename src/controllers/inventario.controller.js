
const Lote = require('../models/Lote');
const Producto = require('../models/Producto');
const OrdenCompra = require('../models/OrdenCompra'); 

const inventarioController = {

  // GET /api/inventario
  resumen: async (req, res, next) => {
    try {
      const lotes = await Lote.find().populate('productoId', 'nombre codigoSKU');
      const resumen = {};

      lotes.forEach(lote => {
        if (!lote.productoId) return; // Blindaje por si hay lotes huérfanos
        const prodId = lote.productoId._id.toString();
        if (!resumen[prodId]) {
          resumen[prodId] = {
            producto: lote.productoId,
            stockActual: 0,
            lotes: []
          };
        }
        resumen[prodId].stockActual += lote.cantidadActual;
        resumen[prodId].lotes.push(lote);
      });

      res.json(Object.values(resumen));
    } catch (error) {
      next(error);
    }
  },

  // POST /api/inventario/lotes
  ingresarLote: async (req, res, next) => {
    try {
      const { productoId } = req.body;

      // REGLA DE ORO: Buscamos si existe al menos una orden 'recibida' o 'aprobada' para este producto
      const ordenAutorizada = await OrdenCompra.findOne({
        "items.productoId": productoId,
        estado: { $in: ['aprobada', 'recibida'] }
      });

      if (!ordenAutorizada) {
        return res.status(400).json({ 
          error: "Operación Bloqueada: No se puede registrar stock de este producto porque no existe ninguna Orden de Compra AUTORIZADA o APROBADA para el suministro." 
        });
      }

      // Si pasa la validación, creamos el lote de forma segura
      const nuevoLote = await Lote.create(req.body);
      
      const loteCompleto = await Lote.findById(nuevoLote._id).populate('productoId');
      res.status(201).json(loteCompleto);
    } catch (error) {
      next(error);
    }
  }, 

  // GET /api/inventario/alertas
  alertas: async (req, res, next) => {
    try {
      const hoy = new Date();
      const lotes = await Lote.find({ cantidadActual: { $gt: 0 } })
        .populate('productoId', 'nombre stockMinimo');

      // Filtramos únicamente por la regla de negocio de vencimiento próximo
      const alertas = lotes.filter(lote => {
        if (!lote.fechaVencimiento) return false;
        const diasRestantes = Math.ceil((new Date(lote.fechaVencimiento) - hoy) / (1000 * 60 * 60 * 24));
        return diasRestantes <= 90;
      });

      res.json(alertas);
    } catch (error) {
      next(error);
    }
  }, 

  stockProducto: async (req, res, next) => {
    try {
      const lotes = await Lote.find({ 
        productoId: req.params.productoId,
        cantidadActual: { $gt: 0 }
      });
      
      const stockTotal = lotes.reduce((total, lote) => total + lote.cantidadActual, 0);
      
      res.json({ 
        productoId: req.params.productoId, 
        stockActual: stockTotal,
        lotes 
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = inventarioController;