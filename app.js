const express = require('express')
const app = express()


app.set('view engine', 'pug')
app.set('views', './views')

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

function logger(req, res, next) {
  const ahora = new Date().toLocaleTimeString()
  console.log(`[${ahora}] ${req.method} ${req.url}`)
  next()
}
app.use(logger)

const productosRoutes = require('./src/routes/productos.routes')
const clientesRoutes  = require('./src/routes/clientes.routes')
const ventasRoutes    = require('./src/routes/ventas.routes')

app.use('/productos', productosRoutes)
app.use('/clientes',  clientesRoutes)
app.use('/ventas',    ventasRoutes)

app.use((err, req, res, next) => {
  console.error('Error del servidor:', err.message)
  res.status(500).json({ error: err.message })
})

// ─── INICIO DEL SERVIDOR ──────────────────────────────────────────────────────
const PORT = 3000
app.listen(PORT, () => {
  console.log(`TodoStock corriendo en http://localhost:${PORT}`)
  console.log(`Productos: http://localhost:${PORT}/productos`)
  console.log(`Clientes:  http://localhost:${PORT}/clientes`)
  console.log(`Ventas:    http://localhost:${PORT}/ventas`)
})