const mongoose = require('mongoose');

const itemOrdenSchema = new mongoose.Schema({
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
    required: true
  }
});

const ordenCompraSchema = new mongoose.Schema({
  proveedorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proveedor',
    required: true
  },
  items: [itemOrdenSchema],
  observaciones: String,
  estado: {
    type: String,
    enum: ['pendiente', 'aprobada', 'recibida'],
    default: 'pendiente'
  },
  total: Number,
  fechaAprobacion: Date,
  fechaRecepcion: Date
}, {
  timestamps: true
});

const OrdenCompra = mongoose.model('OrdenCompra', ordenCompraSchema);

module.exports = OrdenCompra;