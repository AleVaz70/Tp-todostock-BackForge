const fs   = require('fs')
const path = require('path')

// Mismo patrón que productos.storage.
// Cada módulo tiene su propio archivo JSON independiente
// para que los datos estén separados y sean fáciles de encontrar.
const ARCHIVO = path.join(__dirname, '../../data/ventas.json')

function leer() {
  const contenido = fs.readFileSync(ARCHIVO, 'utf-8')
  return JSON.parse(contenido)
}

function escribir(datos) {
  fs.writeFileSync(ARCHIVO, JSON.stringify(datos, null, 2), 'utf-8')
}

function generarId(datos) {
  if (datos.length === 0) return 1
  return Math.max(...datos.map(v => v.id)) + 1
}

module.exports = { leer, escribir, generarId }