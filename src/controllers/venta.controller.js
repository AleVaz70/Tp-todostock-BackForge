const Pedido = require('../models/Pedido');
const Cliente = require('../models/Cliente');
const Lote = require('../models/Lote');
const Producto = require('../models/Producto');

const ventaController = {

  listar: async (req, res, next) => {
    try {
      const { clienteId } = req.query;
      let query = {};
      if (clienteId) query.clienteId = clienteId;

      const pedidos = await Pedido.find(query)
        .populate('clienteId', 'nombre cuit')
        .populate('items.productoId', 'nombre codigoSKU')
        .sort({ fechaCreacion: -1 });

      res.json(pedidos);
    } catch (error) {
      next(error);
    }
  },

  obtener: async (req, res, next) => {
    try {
      const pedido = await Pedido.findById(req.params.id)
        .populate('clienteId')
        .populate('items.productoId');

      if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
      res.json(pedido);
    } catch (error) {
      next(error);
    }
  },

  crear: async (req, res, next) => {
    try {
      const { clienteId, items, observaciones } = req.body;

      const cliente = await Cliente.findById(clienteId);
      if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
      if (!cliente.activo) return res.status(400).json({ error: 'El cliente está bloqueado' });

      const itemsProcesadosWithMarkup = [];
      let totalNuevaVenta = 0;

      for (const item of items) {
        const prodBD = await Producto.findById(item.productoId);
        if (!prodBD) {
          return res.status(404).json({ error: `Producto con ID ${item.productoId} no encontrado.` });
        }

        const precioVentaMayorista = Math.round((prodBD.precio * 1.40) * 100) / 100;
        const subtotalItem = item.cantidad * precioVentaMayorista;
        totalNuevaVenta += subtotalItem;

        itemsProcesadosWithMarkup.push({
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario: precioVentaMayorista
        });
      }

      const saldoActual = cliente.saldo || 0;

      if ((saldoActual + totalNuevaVenta) > cliente.limiteCredito) {
        return res.status(400).json({ 
          error: `Operación RECHAZADA: Supera el límite de crédito corporativo. Disponible: $${(cliente.limiteCredito - saldoActual).toFixed(2)}, Total pedido: $${totalNuevaVenta.toFixed(2)}` 
        });
      }

      const nuevoPedido = await Pedido.create({
        clienteId,
        items: itemsProcesadosWithMarkup,
        observaciones,
        total: totalNuevaVenta,
        estado: 'pendiente'
      });
      global.pedidoVentaId = nuevoPedido._id.toString();

      const pedidoCompleto = await Pedido.findById(nuevoPedido._id)
        .populate('clienteId', 'nombre')
        .populate('items.productoId', 'nombre');

      res.status(201).json(pedidoCompleto);
    } catch (error) {
      next(error);
    }
  },

  despachar: async (req, res, next) => {
    try {
      const pedido = await Pedido.findById(req.params.id);
      if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
      
      const estadoActual = pedido.estado || 'pendiente';
      if (estadoActual !== 'pendiente') {
        return res.status(400).json({ error: `El pedido ya está ${estadoActual}` });
      }

      for (const item of pedido.items) {
        const lotesDisponibles = await Lote.find({
          productoId: item.productoId,
          cantidadActual: { $gt: 0 }
        }).sort({ fechaVencimiento: 1 });

        const stockTotal = lotesDisponibles.reduce((total, lote) => total + lote.cantidadActual, 0);

        if (stockTotal < item.cantidad) {
          return res.status(400).json({
            error: `Stock insuficiente. Disponible: ${stockTotal} u., Solicitado: ${item.cantidad} u.`
          });
        }
      }

      const movimientos = [];
      for (const item of pedido.items) {
        let restante = item.cantidad;
        const lotes = await Lote.find({
          productoId: item.productoId,
          cantidadActual: { $gt: 0 }
        }).sort({ fechaVencimiento: 1 });

        for (const lote of lotes) {
          if (restante <= 0) break;

          const aDescontar = Math.min(lote.cantidadActual, restante);
          lote.cantidadActual -= aDescontar;
          restante -= aDescontar;

          if (!lote.egresos) lote.egresos = [];
          
          lote.egresos.push({
            pedidoId: pedido._id,
            clienteId: pedido.clienteId,
            cantidad: aDescontar,
            fecha: new Date()
          });

          await lote.save();

          movimientos.push({
            loteId: lote._id,
            cantidadDescontada: aDescontar
          });
        }
      }

      const clienteBD = await Cliente.findById(pedido.clienteId);
      if (clienteBD) {
        clienteBD.saldo = (clienteBD.saldo || 0) + pedido.total;
        await clienteBD.save();
      }

      pedido.estado = 'despachado';
      pedido.fechaDespacho = new Date();
      pedido.set('movimientosStock', movimientos, { strict: false });
      
      await pedido.save();

      res.json({
        mensaje: 'Pedido despachado correctamente con control FEFO',
        pedido,
        movimientosStock: movimientos
      });
    } catch (error) {
      console.error('Error en despacho:', error);
      next(error);
    }
  },

  cancelar: async (req, res, next) => {
    try {
      const pedido = await Pedido.findById(req.params.id);
      if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
      if (pedido.estado === 'despachado') {
        return res.status(400).json({ error: 'No se puede cancelar un pedido ya despachado' });
      }

      pedido.estado = 'cancelado';
      await pedido.save();

      res.json({ mensaje: 'Pedido cancelado correctamente', pedido });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = ventaController;