const Pedido = require('../models/Pedido');
const Cliente = require('../models/Cliente');
const Lote = require('../models/Lote');

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

      // 1. Calculamos el total de la nueva orden
      const totalNuevaVenta = items.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);

      // 2. Traemos el saldo actual que tiene en la base de datos (o 0 si no tiene)
      const saldoActual = cliente.saldo || 0;

      // 3. REQUERIMIENTO OBLIGATORIO: Validar límite de crédito
      if ((saldoActual + totalNuevaVenta) > cliente.limiteCredito) {
        
        // 🛠️ CORRECCIÓN: Registramos el pedido en la base de datos con estado 'denegado' antes de rebotar la petición
        await Pedido.create({
          clienteId,
          items,
          observaciones,
          total: totalNuevaVenta,
          estado: 'denegado' // Se guarda físicamente como denegado
        });

        return res.status(400).json({ 
          error: `Operación rechazada: El cliente ${cliente.nombre} supera su límite de crédito. Crédito Disponible: $${cliente.limiteCredito - saldoActual}, Total pedido: $${totalNuevaVenta}. El pedido fue registrado automáticamente como DENEGADO.` 
        });
      }

      // Si pasa la validación de crédito, se crea el pedido normalmente (por defecto Mongoose le pone 'pendiente')
      const nuevoPedido = await Pedido.create({
        clienteId,
        items,
        observaciones,
        total: totalNuevaVenta
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

  // ==================== DESPACHAR CON CONTROL DE STOCK Y FEFO ====================
  despachar: async (req, res, next) => {
    try {
      const pedido = await Pedido.findById(req.params.id);
      if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
      if (pedido.estado !== 'pendiente') {
        return res.status(400).json({ error: `El pedido ya está ${pedido.estado}` });
      }

      // Verificar stock disponible por producto (FEFO)
      for (const item of pedido.items) {
        const lotesDisponibles = await Lote.find({
          productoId: item.productoId,
          cantidadActual: { $gt: 0 }
        }).sort({ fechaVencimiento: 1 }); // Orden FEFO

        const stockTotal = lotesDisponibles.reduce((total, lote) => total + lote.cantidadActual, 0);

        if (stockTotal < item.cantidad) {
          return res.status(400).json({
            error: `Stock insuficiente para el producto ${item.productoId}. Disponible: ${stockTotal}, Solicitado: ${item.cantidad}`
          });
        }
      }

      // Descontar stock (lógica FEFO)
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

          lote.egresos.push({
            pedidoId: pedido._id,
            clienteId: pedido.clienteId,
            cantidad: aDescontar,
            fecha: new Date()
          });

          await lote.save();

          movimientos.push({
            loteId: lote._id,
            cantidadDescontada: aDesmetar
          });
        }
      }

      // Actualizar pedido
      pedido.estado = 'despachado';
      pedido.fechaDespacho = new Date();
      pedido.movimientosStock = movimientos;
      await pedido.save();

      res.json({
        mensaje: 'Pedido despachado correctamente con control FEFO',
        pedido,
        movimientosStock: movimientos
      });

    } catch (error) {
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