const jwt = require('jsonwebtoken');

// Middleware para verificar que el usuario esté logueado
exports.protegerRuta = (req, res, next) => {
  // Buscar el token en los headers (API) o en las cookies (Navegador/Pug)
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    // Si es una petición web de Pug, lo redirigimos al formulario de Login
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(401).json({ mensaje: 'No autorizado. Debe iniciar sesión.' });
    }
    return res.redirect('/login');
  }

  try {
    // Verificar que el token no haya expirado y sea legítimo
    const verificado = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_todostock_2026');
    req.usuario = verificado; // Inyectamos los datos del usuario en la petición (req)
    next();
  } catch (error) {
    res.clearCookie('token');
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(401).json({ mensaje: 'Sesión inválida o expirada.' });
    }
    return res.redirect('/login');
  }
};

// Middleware de Autorización por Roles (RBAC)
exports.permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ mensaje: 'No autenticado' });
    }

    // Comparamos si el rol extraído del token está en la lista de roles permitidos de la ruta
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        mensaje: `Acceso denegado: Tu rol (${req.usuario.rol}) no tiene permisos para esta acción.` 
      });
    }
    next();
  }
};