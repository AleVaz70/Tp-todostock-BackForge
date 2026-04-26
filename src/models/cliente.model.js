// ─── MODELO DE CLIENTE ────────────────────────────────────────────────────────
// Usamos POO con una clase para garantizar que todo cliente que entre
// al sistema tenga la estructura y validaciones correctas.

class Cliente {
  constructor({ nombre, cuit, telefono, email, direccion, limiteCredito, diasPlazo, condicionIVA }) {
    if (!nombre || !cuit) {
      throw new Error('Faltan campos obligatorios: nombre, cuit')
    }

    // Validamos el formato del CUIT porque TodoStock necesita CUITs válidos
    // para la futura integración con AFIP (facturación electrónica).
    const cuitRegex = /^\d{2}-\d{8}-\d{1}$/
    if (!cuitRegex.test(cuit)) {
      throw new Error('El CUIT debe tener el formato XX-XXXXXXXX-X')
    }

    if (limiteCredito != null && Number(limiteCredito) < 0) {
      throw new Error('El límite de crédito no puede ser negativo')
    }

    // condicionIVA determina qué tipo de factura emite TodoStock al cliente.
    const condicionesValidas = ['responsable_inscripto', 'monotributista', 'exento', 'consumidor_final']
    if (condicionIVA && !condicionesValidas.includes(condicionIVA)) {
      throw new Error(`condicionIVA inválida. Valores posibles: ${condicionesValidas.join(', ')}`)
    }

    this.nombre       = nombre
    this.cuit         = cuit
    this.telefono     = telefono     || null
    this.email        = email        || null
    this.direccion    = direccion    || null
    this.condicionIVA = condicionIVA || 'responsable_inscripto'
    // ?? diferencia entre "no enviaron el campo" (usa default)
    // y "enviaron explícitamente 0" (respeta el 0).
    this.limiteCredito = limiteCredito ?? 0
    this.diasPlazo     = diasPlazo    ?? 30
    // Usamos activo en lugar de eliminar físicamente porque un cliente
    // puede tener ventas históricas. Eliminarlo rompería esas referencias.
    this.activo        = true
    this.fechaCreacion = new Date().toISOString()
  }
}

module.exports = { Cliente }