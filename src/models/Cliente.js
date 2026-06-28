const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  cuit: {
    type: String,
    required: [true, 'El CUIT es obligatorio'],
    unique: true,
    match: [/^\d{2}-\d{8}-\d{1}$/, 'Formato de CUIT inválido: XX-XXXXXXXX-X']
  },
  telefono: String,
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  direccion: String,
  condicionIVA: {
    type: String,
    enum: ['responsable_inscripto', 'monotributista', 'exento', 'consumidor_final'],
    default: 'responsable_inscripto'
  },
  limiteCredito: {
    type: Number,
    default: 0,
    min: 0
  },
  saldo: { 
    type: Number,
    default: 0,
    min: 0
  },
  diasPlazo: {
    type: Number,
    default: 30,
    min: 0
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Cliente = mongoose.model('Cliente', clienteSchema);

module.exports = Cliente;