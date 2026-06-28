const mongoose = require('mongoose');

const proveedorSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  cuit: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\d{2}-\d{8}-\d{1}$/, 'Formato de CUIT inválido']
  },
  telefono: String,
  email: String,
  direccion: String,
  rubro: String,
  condicionPago: {
    type: String,
    default: 'contado'
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Proveedor = mongoose.model('Proveedor', proveedorSchema);

module.exports = Proveedor;