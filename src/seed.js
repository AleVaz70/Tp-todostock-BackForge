const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Producto = require('./models/Producto');
const Cliente = require('./models/Cliente');
const Proveedor = require('./models/Proveedor');
const Lote = require('./models/Lote');
const OrdenCompra = require('./models/OrdenCompra');
const Pedido = require('./models/Pedido');

dotenv.config();

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB para seed...');

    // 💡 AHORA VACIÁNDOSE AL 100% TODO EL ÁRBOL DE DOCUMENTOS
    await Promise.all([
      Producto.deleteMany({}),
      Cliente.deleteMany({}),
      Proveedor.deleteMany({}),
      Lote.deleteMany({}),
      OrdenCompra.deleteMany({}), // ← Evita órdenes fantasmas
      Pedido.deleteMany({})       // ← Evita ventas fantasmas
    ]);

    // === PROVEEDORES (ID FIJO) ===
    const proveedores = await Proveedor.create([
      { 
        _id: new mongoose.Types.ObjectId("6a0a96163559573d57975624"),
        nombre: "Unilever Argentina", 
        cuit: "30-50123456-7", 
        rubro: "Productos de Consumo" 
      },
      { 
        nombre: "Procter & Gamble", 
        cuit: "33-71234567-8", 
        rubro: "Limpieza e Higiene" 
      }
    ]);

    // === CLIENTES ===
    const clientes = await Cliente.create([
      { 
        _id: new mongoose.Types.ObjectId("6a0a966b3559573d57975626"),
        nombre: "Almacén El Progreso", 
        cuit: "20-12345678-9", 
        limiteCredito: 150000, 
        diasPlazo: 30,
        saldo: 0
      },
      { 
        nombre: "Supermercado Norte", 
        cuit: "30-98765432-1", 
        limiteCredito: 500000, 
        diasPlazo: 15,
        saldo: 0
      }
    ]);

    // === PRODUCTOS ===
    const productos = await Producto.create([
      { 
        _id: new mongoose.Types.ObjectId("6a0a97033559573d57975629"),
        nombre: "Lavandina 5L", 
        categoria: "Desinfectantes", 
        unidad: "un", 
        precio: 1450, 
        stockMinimo: 20, 
        codigoSKU: "LAV-001" 
      },
      { 
        nombre: "Detergente Líquido 1L", 
        categoria: "Detergentes", 
        unidad: "un", 
        precio: 890, 
        stockMinimo: 50, 
        codigoSKU: "DET-002" 
      }
    ]);

    console.log('✅ Base de datos reseteada a cero y poblada con éxito!');
    console.log(`Productos: ${productos.length} | Clientes: ${clientes.length} | Proveedores: ${proveedores.length}`);
    console.log('📌 Historial transaccional limpio e IDs sincronizados con pruebas.http');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seedDatabase();