const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

// Registro de Usuarios Nuevos
exports.registrar = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // 1. Validar si el email ya está registrado
    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado' });
    }

    // 2. Cifrar la contraseña usando el método estático PBKDF2 del modelo
    const { salt, passwordHash } = Usuario.crearPasswordSeguro(password);

    // 3. Guardar el nuevo usuario en MongoDB
    const nuevoUsuario = new Usuario({
      nombre,
      email,
      passwordHash,
      salt,
      rol
    });

    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario registrado con éxito', usuario: { nombre, email, rol } });
  } catch (error) {
    next(error);
  }
};

// Inicio de Sesión (Login)
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar al usuario en la base de datos
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas (Usuario no encontrado)' });
    }

    // 2. Validar la contraseña ingresada con el hash de la base de datos
    const esValida = usuario.validarPassword(password);
    if (!esValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas (Contraseña incorrecta)' });
    }

    // 3. Crear el Token de acceso (JWT) firmado con una clave secreta
    const token = jwt.sign(
      { id: usuario._id, nombre: usuario.nombre, rol: usuario.rol },
      process.env.JWT_SECRET || 'clave_secreta_todostock_2026',
      { expiresIn: '2h' }
    );

    // 4. Guardar el token en una Cookie del navegador para que persista en las vistas Pug
    res.cookie('token', token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 }); // 2 horas

    // Responder éxito
    res.status(200).json({ mensaje: 'Login correcto', usuario: { nombre: usuario.nombre, rol: usuario.rol } });
  } catch (error) {
    next(error);
  }
};

// Cerrar Sesión (Logout)
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ mensaje: 'Sesión cerrada correctamente' });
};