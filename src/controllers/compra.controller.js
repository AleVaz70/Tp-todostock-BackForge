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

      const nuevaOrden = await OrdenCompra.create({
        proveedorId,
        items,
        observaciones,
        total: items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0)
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
      const orden = await OrdenCompra.findById(req.params.id);
      if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
      if (orden.estado !== 'aprobada') {
        return res.status(400).json({ error: `La orden debe estar aprobada para recibirla` });
      }

      orden.estado = 'recibida';
      orden.fechaRecepcion = new Date();
      await orden.save();

      res.json({ 
        mensaje: 'Orden recibida correctamente. Ahora puedes ingresar los lotes en /api/inventario/lotes',
        orden 
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = compraController;