const mongoose = require('mongoose');

const loteSchema = new mongoose.Schema({
  productoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  proveedorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proveedor'
  },
  numeroLote: {
    type: String,
    required: [true, 'El número de lote es obligatorio'],
    trim: true
  },
  cantidadInicial: {
    type: Number,
    required: true,
    min: 1
  },
  cantidadActual: {
    type: Number,
    required: true,
    min: 0
  },
  fechaVencimiento: {
    type: Date,
    required: true
  },
  fechaElaboracion: Date,
  fechaIngreso: {
    type: Date,
    default: Date.now
  },
  egresos: [{
    pedidoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pedido' },
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
    cantidad: Number,
    fecha: { type: Date, default: Date.now },
    tipo: String
  }]
}, {
  timestamps: true
});

const Lote = mongoose.model('Lote', loteSchema);

module.exports = Lote;