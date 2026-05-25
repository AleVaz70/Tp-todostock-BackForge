const service = require('../services/productos.service')

function index(req, res) {
  try {
    const productos = service.listarProductos()
    res.render('productos/index', {
      titulo:   'Catálogo de Productos',
      productos
    })
  } catch (e) {
    res.status(500).render('error', { mensaje: e.message })
  }
}

function detalle(req, res) {
  try {
    const producto = service.obtenerProducto(Number(req.params.id))
    res.render('productos/detalle', {
      titulo: producto.nombre,
      producto
    })
  } catch (e) {
    res.status(404).render('error', { mensaje: e.message })
  }
}

function listar(req, res) {
  try {
    if (req.query.categoria) {
      return res.json(service.listarPorCategoria(req.query.categoria))
    }
    res.json(service.listarProductos())
  } catch (e) {
    res.status(404).json({ error: e.message })
  }
}

function obtener(req, res) {
  try {
    res.json(service.obtenerProducto(Number(req.params.id)))
  } catch (e) {
    res.status(404).json({ error: e.message })
  }
}

function crear(req, res) {
  try {
    const nuevo = service.agregarProducto(req.body)
    res.status(201).json(nuevo)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

function actualizar(req, res) {
  try {
    const actualizado = service.actualizarProducto(Number(req.params.id), req.body)
    res.json(actualizado)
  } catch (e) {
    res.status(404).json({ error: e.message })
  }
}

function eliminar(req, res) {
  try {
    res.json(service.eliminarProducto(Number(req.params.id)))
  } catch (e) {
    res.status(404).json({ error: e.message })
  }
}

module.exports = { index, detalle, listar, obtener, crear, actualizar, eliminar }