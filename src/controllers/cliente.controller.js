const Cliente = require('../models/Cliente');

const clienteController = {

  listar: async (req, res, next) => {
    try {
      const { soloActivos } = req.query;
      let query = {};
      
      if (soloActivos === 'true') {
        query.activo = true;
      }

      const clientes = await Cliente.find(query).sort({ nombre: 1 });
      res.json(clientes);
    } catch (error) {
      next(error);
    }
  },

  obtener: async (req, res, next) => {
    try {
      const cliente = await Cliente.findById(req.params.id);
      if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
      res.json(cliente);
    } catch (error) {
      next(error);
    }
  },

  crear: async (req, res, next) => {
    try {
      const nuevoCliente = await Cliente.create(req.body);
      res.status(201).json(nuevoCliente);
    } catch (error) {
      next(error);
    }
  },

  actualizar: async (req, res, next) => {
    try {
      const cliente = await Cliente.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
      res.json(cliente);
    } catch (error) {
      next(error);
    }
  },

  bloquear: async (req, res, next) => {
    try {
      const cliente = await Cliente.findByIdAndUpdate(
        req.params.id,
        { activo: false },
        { new: true }
      );
      if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
      res.json({ mensaje: `Cliente ${cliente.nombre} bloqueado`, cliente });
    } catch (error) {
      next(error);
    }
  },

  desbloquear: async (req, res, next) => {
    try {
      const cliente = await Cliente.findByIdAndUpdate(
        req.params.id,
        { activo: true },
        { new: true }
      );
      if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
      res.json({ mensaje: `Cliente ${cliente.nombre} reactivado`, cliente });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = clienteController;