const OrdenCompra = require('../models/OrdenCompra');
const Proveedor = require('../models/Proveedor');
const Producto = require('../models/Producto');

const compraController = {

  // GET /api/compras
  listar: async (req, res, next) => {
    try {
      const { estado } = req.query;
      let query = {};

      if (estado) query.estado = estado;

      const ordenes = await OrdenCompra.find(query)
        .populate('proveedorId', 'nombre cuit')
        .populate('items.productoId', 'nombre codigoSKU')
        .sort({ fechaCreacion: -1 });

      res.json(ordenes);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/compras/:id
  obtener: async (req, res, next) => {
    try {
      const orden = await OrdenCompra.findById(req.params.id)
        .populate('proveedorId')
        .populate('items.productoId');

      if (!orden) return res.status(404).json({ error: 'Orden de compra no encontrada' });
      res.json(orden);
    } catch (error) {
      next(error);
    }
  },

  
  // POST /api/compras 
  crear: async (req, res, next) => {
    try {
      const { proveedorId, items, observaciones } = req.body;

      const proveedor = await Proveedor.findById(proveedorId);
      if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
      if (!proveedor.activo) return res.status(400).json({ error: 'El proveedor está bloqueado' });

      // ASEGURAMOS EL MAPEO DE CAMPOS HACIA EL MODELO ORDENCOMPRA
      const itemsMapeadosParaBD = items.map(item => ({
        productoId: item.productoId, // ← Forzamos que se guarde bajo esta propiedad exacta
        cantidad: parseInt(item.cantidad),
        precioUnitario: parseFloat(item.precioUnitario)
      }));

      const nuevaOrden = await OrdenCompra.create({
        proveedorId,
        items: itemsMapeadosParaBD, 
        observaciones,
        total: itemsMapeadosParaBD.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0)
      });
      
      global.ordenCompraId = nuevaOrden._id.toString();
      
      const ordenCompleta = await OrdenCompra.findById(nuevaOrden._id)
        .populate('proveedorId', 'nombre')
        .populate('items.productoId', 'nombre');

      res.status(201).json(ordenCompleta);
    } catch (error) {
      next(error);
    }
  },
  // PATCH /api/compras/:id/aprobar
  aprobar: async (req, res, next) => {
    try {
      const orden = await OrdenCompra.findById(req.params.id);
      if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
      if (orden.estado !== 'pendiente') {
        return res.status(400).json({ error: `La orden ya está ${orden.estado}` });
      }

      orden.estado = 'aprobada';
      orden.fechaAprobacion = new Date();
      await orden.save();

      res.json({ mensaje: 'Orden aprobada correctamente', orden });
    } catch (error) {
      next(error);
    }
  },

// PATCH /api/compras/:id/recibir 
  recibir: async (req, res, next) => {
    try {
      const Lote = require('../models/Lote');
      const orden = await OrdenCompra.findById(req.params.id);
      
      if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
      if (orden.estado !== 'aprobada') {
        return res.status(400).json({ error: `La orden debe estar aprobada para recibirla` });
      }

      // REGLA DE NEGOCIO INTEGRAL: Validamos ítem por ítem que el depósito ya tenga stock disponible
      for (const item of orden.items) {
        // Buscamos si hay algún lote activo en el sistema para este producto
        const lotesExistentes = await Lote.find({
          productoId: item.productoId,
          cantidadActual: { $gt: 0 } // Que tenga stock cargado
        });

        // Sumamos el stock que el operario ya ingresó para ese artículo
        const stockIngresadoEnDeposito = lotesExistentes.reduce((total, lote) => total + lote.cantidadActual, 0);

        // Si el depósito está en 0 o cargaron menos de lo pactado, bloqueamos por seguridad
        if (stockIngresadoEnDeposito < item.cantidad) {
          return res.status(400).json({
            error: `Operación Rechazada: No se puede recibir la Orden comercial. El sistema detecta que en Depósito solo hay ${stockIngresadoEnDeposito} u. disponibles de este artículo, pero la orden exige la recepción física de ${item.cantidad} u.`
          });
        }
      }

      // Si todos los productos de la orden tienen su stock cargado previamente en inventario:
      orden.estado = 'recibida';
      orden.fechaRecepcion = new Date();
      await orden.save();

      res.json({ 
        mensaje: '¡Mercadería recibida con éxito! Los lotes físicos fueron cruzados y validados correctamente con la orden comercial.',
        orden 
      });
    } catch (error) {
      console.error('Error en flujo de validación de compras:', error);
      next(error);
    }
  }
};

module.exports = compraController;