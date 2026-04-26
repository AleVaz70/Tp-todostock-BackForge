// ─── MODELO DE PRODUCTO ───────────────────────────────────────────────────────
// El modelo aplica el principio de POO (Programación Orientada a Objetos)
// usando una clase para representar la entidad Producto.
// Centralizar la construcción y validación en una clase garantiza que
// ningún producto mal formado pueda entrar al sistema desde ningún módulo.

class Producto {
  constructor({ nombre, categoria, unidad, precio, stockMinimo, codigoSKU, descripcion }) {

    // Validamos los campos obligatorios antes de construir el objeto.
    // Lanzar un error acá impide que el objeto se cree en estado inválido.
    if (!nombre || !categoria || !unidad || precio == null || stockMinimo == null) {
      throw new Error('Faltan campos obligatorios: nombre, categoria, unidad, precio, stockMinimo')
    }

    // Un precio negativo rompería el cálculo de totales en ventas.
    if (Number(precio) < 0) {
      throw new Error('El precio no puede ser negativo')
    }

    // Un stockMinimo negativo haría que las alertas de reposición nunca se activen.
    if (Number(stockMinimo) < 0) {
      throw new Error('El stock mínimo no puede ser negativo')
    }

    // codigoSKU identifica unívocamente cada presentación en el catálogo.
    // Sin este campo no podemos distinguir "Lavandina 1L" de "Lavandina 2L" si tienen el mismo nombre.
    this.codigoSKU    = codigoSKU   || null
    this.nombre       = nombre
    this.descripcion  = descripcion || null
    this.categoria    = categoria
    this.unidad       = unidad
    // Number() fuerza la conversión para evitar que llegue el string "850"
    // y rompa las operaciones aritméticas en ventas.
    this.precio       = Number(precio)
    this.stockMinimo  = Number(stockMinimo)
    // fechaCreacion sirve para auditoría del catálogo de productos.
    this.fechaCreacion = new Date().toISOString()
  }
}

module.exports = { Producto }