
const express    = require('express')
const router     = express.Router()
const controller = require('../controllers/productos.controller')

function validarId(req, res, next) {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return res.status(400).json({ error: 'El id debe ser un número' })
  }
  next()
}

router.get('/',           controller.index)
router.get('/:id/ver',    validarId, controller.detalle)
router.get('/api',        controller.listar)
router.get('/api/:id',    validarId, controller.obtener)
router.post('/api',       controller.crear)
router.put('/api/:id',    validarId, controller.actualizar)
router.delete('/api/:id', validarId, controller.eliminar)

module.exports = router


