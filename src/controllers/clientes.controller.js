const service = require('../services/clientes.service')

// ─── VISTA: listar todos ──────────────────────────────────────────────────────
function index(req, res) {
  try {
    const clientes = service.listarClientes()
    // Pasamos a la vista tanto el listado como un indicador de cantidad
    // para usar condicionales en Pug (grupo numeroso / reducido).
    res.render('clientes/index', {
      titulo:   'Clientes de TodoStock',
      clientes,
      cantidad: clientes.length
    })
  } catch (e) {
    res.status(500).render('error', { mensaje: e.message })
  }
}

// ─── API: listar ─────────────────────────────────────────────────────────────
function listar(req, res) {
  try {
    if (req.query.soloActivos === 'true') {
      return res.json(service.listarClientesActivos())
    }
    res.json(service.listarClientes())
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// ─── API: obtener uno ────────────────────────────────────────────────────────
function obtener(req, res) {
  try {
    res.json(service.obtenerCliente(Number(req.params.id)))
  } catch (e) {
    res.status(404).json({ error: e.message })
  }
}

// ─── API: crear ──────────────────────────────────────────────────────────────
function crear(req, res) {
  try {
    res.status(201).json(service.agregarCliente(req.body))
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

// ─── API: actualizar ─────────────────────────────────────────────────────────
function actualizar(req, res) {
  try {
    res.json(service.actualizarCliente(Number(req.params.id), req.body))
  } catch (e) {
    res.status(404).json({ error: e.message })
  }
}

// ─── API: bloquear ───────────────────────────────────────────────────────────
// PATCH en lugar de DELETE porque no eliminamos el recurso,
// solo modificamos su campo "activo" a false.
function bloquear(req, res) {
  try {
    res.json(service.bloquearCliente(Number(req.params.id)))
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

// ─── API: desbloquear ────────────────────────────────────────────────────────
function desbloquear(req, res) {
  try {
    res.json(service.desbloquearCliente(Number(req.params.id)))
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

module.exports = { index, listar, obtener, crear, actualizar, bloquear, desbloquear }