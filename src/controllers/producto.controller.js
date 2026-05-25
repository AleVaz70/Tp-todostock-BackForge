const Producto = require('../models/Producto');

const productoController = {
  
  // GET /api/productos
  listar: async (req, res, next) => {
    try {
      const productos = await Producto.find().sort({ nombre: 1 });
      res.json(productos);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/productos/:id
  obtener: async (req, res, next) => {
    try {
      const producto = await Producto.findById(req.params.id);
      if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(producto);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/productos
  crear: async (req, res, next) => {
    try {
      const nuevoProducto = await Producto.create(req.body);
      res.status(201).json(nuevoProducto);
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/productos/:id
  actualizar: async (req, res, next) => {
    try {
      const producto = await Producto.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(producto);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/productos/:id
  eliminar: async (req, res, next) => {
    try {
      const producto = await Producto.findByIdAndDelete(req.params.id);
      if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = productoController;