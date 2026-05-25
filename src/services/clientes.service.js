const storage      = require('../storage/clientes.storage')
const { Cliente }  = require('../models/cliente.model')

function listarClientes() {
  return storage.leer()
}

// Filtramos activos para las pantallas operativas.
// El listado completo queda disponible para administración.
function listarClientesActivos() {
  const todos = storage.leer()
  return todos.filter(c => c.activo)
}

function obtenerCliente(id) {
  const todos = storage.leer()
  const cliente = todos.find(c => c.id === id)
  if (!cliente) throw new Error(`Cliente con id ${id} no encontrado`)
  return cliente
}

function agregarCliente(datos) {
  const todos = storage.leer()
  const nuevo = new Cliente(datos)
  nuevo.id = storage.generarId(todos)
  todos.push(nuevo)
  storage.escribir(todos)
  return nuevo
}

function actualizarCliente(id, datos) {
  const todos = storage.leer()
  const index = todos.findIndex(c => c.id === id)
  if (index === -1) throw new Error(`Cliente con id ${id} no encontrado`)

  const cliente = todos[index]
  if (datos.nombre        != null) cliente.nombre        = datos.nombre
  if (datos.telefono      != null) cliente.telefono      = datos.telefono
  if (datos.email         != null) cliente.email         = datos.email
  if (datos.direccion     != null) cliente.direccion     = datos.direccion
  if (datos.condicionIVA  != null) cliente.condicionIVA  = datos.condicionIVA
  if (datos.limiteCredito != null) cliente.limiteCredito = Number(datos.limiteCredito)
  if (datos.diasPlazo     != null) cliente.diasPlazo     = Number(datos.diasPlazo)

  storage.escribir(todos)
  return cliente
}

// Bloqueamos en lugar de eliminar para preservar el historial de ventas.
// Un cliente bloqueado no puede hacer nuevos pedidos pero su historial queda intacto.
function bloquearCliente(id) {
  const todos = storage.leer()
  const index = todos.findIndex(c => c.id === id)
  if (index === -1) throw new Error(`Cliente con id ${id} no encontrado`)
  if (!todos[index].activo) throw new Error(`El cliente ${id} ya está bloqueado`)

  todos[index].activo = false
  storage.escribir(todos)
  return { mensaje: `Cliente ${todos[index].nombre} bloqueado correctamente`, cliente: todos[index] }
}

function desbloquearCliente(id) {
  const todos = storage.leer()
  const index = todos.findIndex(c => c.id === id)
  if (index === -1) throw new Error(`Cliente con id ${id} no encontrado`)
  if (todos[index].activo) throw new Error(`El cliente ${id} ya está activo`)

  todos[index].activo = true
  storage.escribir(todos)
  return { mensaje: `Cliente ${todos[index].nombre} reactivado correctamente`, cliente: todos[index] }
}

// Esta función la usa ventas.service internamente antes de confirmar un despacho.
// No tiene endpoint HTTP propio porque no es una operación que el usuario dispara.
function verificarCredito(id, montoNuevo, deudaActual) {
  const cliente = obtenerCliente(id)
  if (!cliente.activo) {
    throw new Error(`El cliente ${cliente.nombre} está bloqueado`)
  }
  if (cliente.limiteCredito === 0) return true
  if (deudaActual + montoNuevo > cliente.limiteCredito) {
    throw new Error(
      `El cliente ${cliente.nombre} supera su límite de crédito. ` +
      `Límite: $${cliente.limiteCredito}, deuda actual: $${deudaActual}, pedido: $${montoNuevo}`
    )
  }
  return true
}

module.exports = {
  listarClientes,
  listarClientesActivos,
  obtenerCliente,
  agregarCliente,
  actualizarCliente,
  bloquearCliente,
  desbloquearCliente,
  verificarCredito
}