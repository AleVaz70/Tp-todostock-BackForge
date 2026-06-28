const mongoose = require('mongoose');

const itemPedidoSchema = new mongoose.Schema({
  productoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  precioUnitario: {
    type: Number,
    required: true,
    min: 0
  }
});

const pedidoSchema = new mongoose.Schema({
  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  items: [itemPedidoSchema],
  observaciones: String,
  estado: {
    type: String,
    enum: ['pendiente', 'despachado', 'cancelado'],
    default: 'pendiente'
  },
  total: Number,
  fechaDespacho: Date,
  movimientosStock: Array
}, {
  timestamps: true
});

const Pedido = mongoose.model('Pedido', pedidoSchema);

module.exports = Pedido;