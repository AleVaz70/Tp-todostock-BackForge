const Producto = require('../models/Producto');
const Lote = require('../models/Lote');

const productoController = {
  
  // Para las llamadas de la API (fetch desde el navegador)
  listar: async (req, res, next) => {
    try {
      const productos = await Producto.find().sort({ nombre: 1 });
      
      const productosConStock = await Promise.all(productos.map(async (prod) => {
        const objetoProducto = prod.toObject();
        
        // Buscamos únicamente lotes con mercadería real disponible y vigente
        const lotesActivos = await Lote.find({ 
          productoId: prod._id, 
          cantidadActual: { $gt: 0 } 
        });
        
        objetoProducto.stock = lotesActivos.reduce((total, lote) => total + lote.cantidadActual, 0);
        return objetoProducto;
      }));

      res.json(productosConStock);
    } catch (error) {
      next(error);
    }
  },
  
  // Para el renderizado web inicial mediante el motor PUG
  listarProductosVista: async (req, res, next) => {
    try {
      const productos = await Producto.find().sort({ nombre: 1 });
      
      const productosConStock = await Promise.all(productos.map(async (prod) => {
        const objetoProducto = prod.toObject();
        
        // Unificamos el criterio de stock real consolidado de la distribuidora
        const lotesActivos = await Lote.find({ 
          productoId: prod._id, 
          cantidadActual: { $gt: 0 } 
        });
        
        objetoProducto.stock = lotesActivos.reduce((total, lote) => total + lote.cantidadActual, 0);
        return objetoProducto;
      }));

      res.render('productos/index', { 
        title: 'Catálogo Maestro de Artículos',                  
        titulo: 'Productos', 
        productos: productosConStock,
        usuario: req.usuario 
      });
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