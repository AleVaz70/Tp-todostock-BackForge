const service = require('../services/ventas.service')

function index(req, res) {
  try {
    const pedidos = service.listarPedidos()
    res.render('ventas/index', {
      titulo:  'Pedidos — TodoStock',
      pedidos,
      cantidad: pedidos.length
    })
  } catch (e) {
    res.status(500).render('error', { mensaje: e.message })
  }
}

function listar(req, res) {
  try {
    if (req.query.clienteId) {
      return res.json(service.listarPorCliente(Number(req.query.clienteId)))
    }
    res.json(service.listarPedidos())
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

function obtener(req, res) {
  try {
    res.json(service.obtenerPedido(Number(req.params.id)))
  } catch (e) {
    res.status(404).json({ error: e.message })
  }
}

function crear(req, res) {
  try {
    res.status(201).json(service.crearPedido(req.body))
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

function despachar(req, res) {
  try {
    res.json(service.despacharPedido(Number(req.params.id)))
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

function cancelar(req, res) {
  try {
    res.json(service.cancelarPedido(Number(req.params.id)))
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

module.exports = { index, listar, obtener, crear, despachar, cancelar }