const mongoose = require('mongoose');
const crypto = require('crypto');

const usuarioSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: [true, 'El nombre es obligatorio'] 
  },
  email: { 
    type: String, 
    required: [true, 'El correo es obligatorio'], 
    unique: true,
    lowercase: true
  },
  passwordHash: { 
    type: String 
  },
  salt: { 
    type: String 
  },
  rol: { 
    type: String, 
    enum: ['Administrador', 'Vendedor', 'Compras'], 
    default: 'Vendedor' 
  }
}, { timestamps: true });

/**
 * MÉTODO ESTÁTICO: Cifrar contraseña durante el Registro
 * Recibe la contraseña en texto plano, genera un Salt único y devuelve ambos datos procesados.
 */
usuarioSchema.statics.crearPasswordSeguro = function(password) {
  // 1. Generamos un Salt aleatorio de 16 bytes convertido a texto hexadecimal
  const salt = crypto.randomBytes(16).toString('hex');
  
  // 2. Aplicamos PBKDF2Sync con los parámetros obligatorios de la cátedra:
  // password, salt, 10000 iteraciones, 64 bytes de tamaño, algoritmo sha512
  const passwordHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  
  return { salt, passwordHash };
};

/**
 * MÉTODO DE INSTANCIA: Validar contraseña durante el Login
 * Toma la contraseña ingresada en el formulario, le aplica el Salt guardado en este registro
 * y compara si los hashes resultantes coinciden milimétricamente.
 */
usuarioSchema.methods.validarPassword = function(passwordIngresada) {
  const hashAComparar = crypto.pbkdf2Sync(passwordIngresada, this.salt, 10000, 64, 'sha512').toString('hex');
  return this.passwordHash === hashAComparar;
};

module.exports = mongoose.model('Usuario', usuarioSchema);