const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  codigoSKU: {
    type: String,
    unique: true, 
    sparse: true,
    trim: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    trim: true
  },
  unidad: {
    type: String,
    required: [true, 'La unidad es obligatoria']
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  stockMinimo: {
    type: Number,
    required: [true, 'El stock mínimo es obligatorio'],
    min: [0, 'El stock mínimo no puede ser negativo'],
    default: 5
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'El stock no puede ser negativo']
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para búsquedas frecuentes 
productoSchema.index({ nombre: 'text', categoria: 1 });

const Producto = mongoose.model('Producto', productoSchema, 'productos');

module.exports = Producto;