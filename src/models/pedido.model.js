// ─── MODELO DE PEDIDO ─────────────────────────────────────────────────────────
// El pedido relaciona un cliente con una lista de productos.
// Es el módulo que demuestra la interacción entre módulos que pide el enunciado.

class Pedido {
  constructor({ clienteId, items, observaciones }) {
    if (!clienteId) {
      throw new Error('Falta el campo obligatorio: clienteId')
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('El pedido debe tener al menos un item')
    }

    for (const item of items) {
      if (!item.productoId || !item.cantidad || !item.precioUnitario) {
        throw new Error('Cada item debe tener: productoId, cantidad, precioUnitario')
      }
      if (!Number.isInteger(Number(item.cantidad)) || Number(item.cantidad) <= 0) {
        throw new Error('La cantidad debe ser un número entero positivo')
      }
      if (Number(item.precioUnitario) < 0) {
        throw new Error('El precio unitario no puede ser negativo')
      }
    }

    this.clienteId    = clienteId
    this.items        = items
    this.observaciones = observaciones || null
    // El estado del pedido sigue el flujo: pendiente → despachado → cancelado.
    // Guardarlo en el objeto permite filtrar y auditar pedidos por estado.
    this.estado       = 'pendiente'
    this.fechaCreacion = new Date().toISOString()
    this.fechaDespacho = null
    // total se calcula al crear para no tener que recalcularlo cada vez
    // que se consulta el pedido.
    this.total = items.reduce(
      (sum, item) => sum + Number(item.cantidad) * Number(item.precioUnitario), 0
    )
  }
}

module.exports = { Pedido }