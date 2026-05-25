const storage          = require('../storage/ventas.storage')
const { Pedido }       = require('../models/pedido.model')
const clientesService  = require('./clientes.service')
const productosService = require('./productos.service')

// ─── INTERACCIÓN ENTRE MÓDULOS ────────────────────────────────────────────────
// Este service importa otros dos services directamente con require().
// Esto es la interacción entre módulos que pide el enunciado:
// no llamamos a sus endpoints HTTP, sino que usamos sus funciones directamente.
// Así la lógica queda integrada sin duplicar código.

function listarPedidos() {
  return storage.leer()
}

function listarPorCliente(clienteId) {
  const todos = storage.leer()
  // Verificamos que el cliente exista antes de filtrar.
  clientesService.obtenerCliente(clienteId)
  return todos.filter(p => p.clienteId === clienteId)
}

function obtenerPedido(id) {
  const todos = storage.leer()
  const pedido = todos.find(p => p.id === id)
  if (!pedido) throw new Error(`Pedido con id ${id} no encontrado`)
  return pedido
}

function crearPedido(datos) {
  // 1. Verificamos que el cliente exista y esté activo antes de crear el pedido.
  // Así el vendedor se entera del bloqueo antes de preparar todo el pedido.
  const cliente = clientesService.obtenerCliente(datos.clienteId)
  if (!cliente.activo) {
    throw new Error(`El cliente ${cliente.nombre} está bloqueado y no puede hacer pedidos`)
  }

  // 2. Verificamos que cada producto del pedido exista en el catálogo.
  for (const item of datos.items) {
    productosService.obtenerProducto(Number(item.productoId))
  }

  // 3. Creamos el pedido. La clase Pedido valida la estructura y calcula el total.
  const todos  = storage.leer()
  const nuevo  = new Pedido(datos)
  nuevo.id     = storage.generarId(todos)

  todos.push(nuevo)
  storage.escribir(todos)
  return nuevo
}

function despacharPedido(id) {
  const todos = storage.leer()
  const index = todos.findIndex(p => p.id === id)
  if (index === -1) throw new Error(`Pedido con id ${id} no encontrado`)

  const pedido = todos[index]
  // El flujo de estados es estricto y solo avanza hacia adelante.
  if (pedido.estado !== 'pendiente') {
    throw new Error(`Solo se pueden despachar pedidos pendientes. Estado actual: ${pedido.estado}`)
  }

  // Verificamos crédito del cliente antes de despachar.
  // deudaActual se calcula sumando los totales de sus pedidos despachados.
  const pedidosCliente = todos.filter(
    p => p.clienteId === pedido.clienteId && p.estado === 'despachado'
  )
  const deudaActual = pedidosCliente.reduce((sum, p) => sum + p.total, 0)
  clientesService.verificarCredito(pedido.clienteId, pedido.total, deudaActual)

  pedido.estado       = 'despachado'
  pedido.fechaDespacho = new Date().toISOString()

  storage.escribir(todos)
  return pedido
}

function cancelarPedido(id) {
  const todos = storage.leer()
  const index = todos.findIndex(p => p.id === id)
  if (index === -1) throw new Error(`Pedido con id ${id} no encontrado`)

  if (todos[index].estado === 'despachado') {
    throw new Error('No se puede cancelar un pedido ya despachado')
  }
  if (todos[index].estado === 'cancelado') {
    throw new Error('El pedido ya está cancelado')
  }

  todos[index].estado = 'cancelado'
  storage.escribir(todos)
  return { mensaje: `Pedido ${id} cancelado`, pedido: todos[index] }
}

module.exports = {
  listarPedidos,
  listarPorCliente,
  obtenerPedido,
  crearPedido,
  despacharPedido,
  cancelarPedido
}