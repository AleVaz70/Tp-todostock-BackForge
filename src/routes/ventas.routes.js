const express    = require('express')
const router     = express.Router()
const controller = require('../controllers/ventas.controller')

function validarId(req, res, next) {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return res.status(400).json({ error: 'El id debe ser un número' })
  }
  next()
}

router.get('/',                        controller.index)
router.get('/api',                     controller.listar)
router.get('/api/:id',                 validarId, controller.obtener)
router.post('/api',                    controller.crear)
router.patch('/api/:id/despachar',     validarId, controller.despachar)
router.patch('/api/:id/cancelar',      validarId, controller.cancelar)

module.exports = router