const fs   = require('fs')
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

module.exports = { leer, escribir, generarId }