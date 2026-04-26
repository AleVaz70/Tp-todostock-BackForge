/*const fs   = require('fs')
const path = require('path')

// ─── RUTA AL ARCHIVO JSON ─────────────────────────────────────────────────────
// path.join construye la ruta de forma compatible con Windows, Mac y Linux.
// __dirname es la carpeta donde está este archivo (src/storage).
// Subimos dos niveles con '..' para llegar a la raíz del proyecto y entrar a data/.
const ARCHIVO = path.join(__dirname, '../../data/productos.json')

// ─── LEER DATOS ───────────────────────────────────────────────────────────────
// Cada vez que se llama a leer(), se abre el archivo y se parsea el JSON.
// Esto garantiza que siempre trabajamos con los datos más actuales,
// incluso si otro proceso modificó el archivo mientras el servidor corría.
function leer() {
  const contenido = fs.readFileSync(ARCHIVO, 'utf-8')
  return JSON.parse(contenido)
}

// ─── ESCRIBIR DATOS ───────────────────────────────────────────────────────────
// Reemplaza todo el contenido del archivo con los datos actualizados.
// JSON.stringify con el tercer parámetro (2) formatea el JSON con indentación
// para que sea legible si alguien abre el archivo directamente.
function escribir(datos) {
  fs.writeFileSync(ARCHIVO, JSON.stringify(datos, null, 2), 'utf-8')
}

// ─── GENERADOR DE IDS ─────────────────────────────────────────────────────────
// Buscamos el id más alto entre todos los registros y le sumamos 1.
// Esto evita repetir ids aunque se hayan eliminado registros anteriores.
// Si no hay registros, arranca desde 1.
function generarId(datos) {
  if (datos.length === 0) return 1
  return Math.max(...datos.map(p => p.id)) + 1
}

module.exports = { leer, escribir, generarId }*/

const storage      = require('../storage/productos.storage')
const { Producto } = require('../models/producto.model')

function listarProductos() {
  return storage.leer()
}

function listarPorCategoria(categoria) {
  const todos = storage.leer()
  const resultado = todos.filter(
    p => p.categoria.toLowerCase() === categoria.toLowerCase()
  )
  if (resultado.length === 0) {
    throw new Error(`No hay productos en la categoría "${categoria}"`)
  }
  return resultado
}

function obtenerProducto(id) {
  const todos = storage.leer()
  const producto = todos.find(p => p.id === id)
  if (!producto) throw new Error(`Producto con id ${id} no encontrado`)
  return producto
}

function agregarProducto(datos) {
  const todos = storage.leer()

  if (datos.codigoSKU) {
    const existe = todos.find(p => p.codigoSKU === datos.codigoSKU)
    if (existe) throw new Error(`Ya existe un producto con el código SKU "${datos.codigoSKU}"`)
  }

  const nuevo = new Producto(datos)
  nuevo.id = storage.generarId(todos)

  todos.push(nuevo)
  storage.escribir(todos)
  return nuevo
}

function actualizarProducto(id, datos) {
  const todos = storage.leer()
  const index = todos.findIndex(p => p.id === id)
  if (index === -1) throw new Error(`Producto con id ${id} no encontrado`)

  const producto = todos[index]
  if (datos.codigoSKU   != null) producto.codigoSKU   = datos.codigoSKU
  if (datos.nombre      != null) producto.nombre      = datos.nombre
  if (datos.descripcion != null) producto.descripcion = datos.descripcion
  if (datos.categoria   != null) producto.categoria   = datos.categoria
  if (datos.unidad      != null) producto.unidad      = datos.unidad
  if (datos.precio      != null) producto.precio      = Number(datos.precio)
  if (datos.stockMinimo != null) producto.stockMinimo = Number(datos.stockMinimo)

  storage.escribir(todos)
  return producto
}

function eliminarProducto(id) {
  const todos = storage.leer()
  const index = todos.findIndex(p => p.id === id)
  if (index === -1) throw new Error(`Producto con id ${id} no encontrado`)

  todos.splice(index, 1)
  storage.escribir(todos)
  return { mensaje: `Producto ${id} eliminado correctamente` }
}

module.exports = {
  listarProductos,
  listarPorCategoria,
  obtenerProducto,
  agregarProducto,
  actualizarProducto,
  eliminarProducto
}