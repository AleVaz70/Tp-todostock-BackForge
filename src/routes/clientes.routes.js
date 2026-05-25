const express    = require('express')
const router     = express.Router()
const controller = require('../controllers/clientes.controller')

function validarId(req, res, next) {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return res.status(400).json({ error: 'El id debe ser un número' })
  }
  next()
}

router.get('/',                      controller.index)
router.get('/api',                   controller.listar)
router.get('/api/:id',               validarId, controller.obtener)
router.post('/api',                  controller.crear)
router.put('/api/:id',               validarId, controller.actualizar)
router.patch('/api/:id/bloquear',    validarId, controller.bloquear)
router.patch('/api/:id/desbloquear', validarId, controller.desbloquear)

module.exports = router