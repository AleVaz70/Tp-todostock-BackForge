const Proveedor = require('../models/Proveedor');

const proveedorController = {

  listar: async (req, res, next) => {
    try {
      const { soloActivos } = req.query;
      let query = {};
      
      if (soloActivos === 'true') {
        query.activo = true;
      }

      const proveedores = await Proveedor.find(query).sort({ nombre: 1 });
      res.json(proveedores);
    } catch (error) {
      next(error);
    }
  },

  obtener: async (req, res, next) => {
    try {
      const proveedor = await Proveedor.findById(req.params.id);
      if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
      res.json(proveedor);
    } catch (error) {
      next(error);
    }
  },

  crear: async (req, res, next) => {
    try {
      const nuevoProveedor = await Proveedor.create(req.body);
      res.status(201).json(nuevoProveedor);
    } catch (error) {
      next(error);
    }
  },

  actualizar: async (req, res, next) => {
    try {
      const proveedor = await Proveedor.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
      res.json(proveedor);
    } catch (error) {
      next(error);
    }
  },

  bloquear: async (req, res, next) => {
    try {
      const proveedor = await Proveedor.findByIdAndUpdate(
        req.params.id,
        { activo: false },
        { new: true }
      );
      if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
      res.json({ mensaje: `Proveedor bloqueado`, proveedor });
    } catch (error) {
      next(error);
    }
  },

  desbloquear: async (req, res, next) => {
    try {
      const proveedor = await Proveedor.findByIdAndUpdate(
        req.params.id,
        { activo: true },
        { new: true }
      );
      if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
      res.json({ mensaje: `Proveedor reactivado`, proveedor });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = proveedorController;