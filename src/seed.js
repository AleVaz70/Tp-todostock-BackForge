const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Producto = require('./models/Producto'); 
const Cliente = require('./models/Cliente');
const Proveedor = require('./models/Proveedor');
const Lote = require('./models/Lote');
const OrdenCompra = require('./models/OrdenCompra');
const Pedido = require('./models/Pedido');
const Usuario = require('./models/Usuario');

dotenv.config();

async function seedDatabase() {
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    console.log('Seed ya se está ejecutando o importando en paralelo. Operación omitida.');
    return;
  }

  try {
    // Buscamos la URI del archivo .env
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error('No se encontró la variable MONGO_URI en el archivo de entorno.');
    }

    console.log('Conectando a MongoDB Atlas para la carga maestra e integrada...');
    await mongoose.connect(MONGO_URI);

    console.log('Limpiando colecciones previas para evitar colisiones de redundancia...');
    await Promise.all([
      Usuario.deleteMany({}),
      Proveedor.deleteMany({}),
      Producto.deleteMany({}),
      Cliente.deleteMany({}),
      Lote.deleteMany({}),
      Pedido.deleteMany({}),
      OrdenCompra.deleteMany({})
    ]);
    
    console.log('Base de datos completamente limpia en la nube.');

    // ─── 1. USUARIOS INICIALES DE ACCESO CON PASSPORTS ──────────────────────
    console.log(' Generando credenciales y contraseñas seguras...');
    const seguridadAdmin = Usuario.crearPasswordSeguro('admin123');
    const seguridadVendedor = Usuario.crearPasswordSeguro('ventas123');
    const seguridadCompras = Usuario.crearPasswordSeguro('compras123');

    const usuarios = await Usuario.create([
      { nombre: "José Administrador", email: "admin@todostock.com", passwordHash: seguridadAdmin.passwordHash, salt: seguridadAdmin.salt, rol: "Administrador" },
      { nombre: "Juan Vendedor", email: "ventas@todostock.com", passwordHash: seguridadVendedor.passwordHash, salt: seguridadVendedor.salt, rol: "Vendedor" },
      { nombre: "Pedro Compras", email: "compras@todostock.com", passwordHash: seguridadCompras.passwordHash, salt: seguridadCompras.salt, rol: "Compras" }
    ]);

    // ─── 2. PROVEEDORES HOMOLOGADOS ──────────────────────────────────────────
    console.log(' Insertando proveedores en el catálogo logístico...');
    const proveedores = await Proveedor.create([
      { nombre: 'Química Austral S.A.', cuit: '30-71458962-9', contacto: '11-4588-9922 (Ventas)', activo: true },
      { nombre: 'Unilever Argentina S.A.', cuit: '30-50123456-7', contacto: '0800-444-2321 (Logística)', activo: true },
      { nombre: 'Procter & Gamble SRL', cuit: '33-71234567-8', contacto: '11-5236-4100 (Distribución)', activo: true }
    ]);

    // ───  3. CLIENTES MAYORISTAS (Segmentados para simulaciones críticas) ──────
    console.log(' Insertando clientes con perfiles financieros específicos...');
    const clientes = await Cliente.create([
      {
        nombre: 'Almacén El Progreso (VIP - Plazo Amplio)',
        cuit: '20-12345678-9',
        limiteCredito: 350000.00,
        diasPlazo: 30,
        saldo: 45000.00, // Inicia con deuda previa para validar el botón "Cobrar" en vivo
        activo: true
      },
      {
        nombre: 'Supermercado Norte (Riesgo Alto - Al Límite)',
        cuit: '30-98765432-1',
        limiteCredito: 120000.00,
        diasPlazo: 15,
        saldo: 95000.00, // Alto saldo deudor: Ideal para forzar el rechazo de ventas por exceso de crédito
        activo: true
      },
      {
        nombre: 'Limpieza Total Abasto (Cliente Nuevo - Contado)',
        cuit: '20-34789512-8',
        limiteCredito: 40000.00,
        diasPlazo: 0,
        saldo: 0.00,
        activo: true
      }
    ]);

    // ───  4. PRODUCTOS DE LIMPIEZA E HIGIENE INDUSTRIAL ─────────────────────
    console.log(' Cargando catálogo maestro de artículos de limpieza...');
    const productos = await Producto.create([
      { nombre: 'Lavandina Concentrada Aditivada 5L', codigoSKU: 'LAV-001', categoria: 'Desinfectantes', precio: 1200.00, stockMinimo: 40, unidad: 'un' },
      { nombre: 'Detergente Líquido Enzimático 1L', codigoSKU: 'DET-002', categoria: 'Detergentes', precio: 890.00, stockMinimo: 50, unidad: 'un' },
      { nombre: 'Desengrasante Multiuso Industrial 5L', codigoSKU: 'DES-IND-5L', categoria: 'Limpiadores Superficies', precio: 2450.00, stockMinimo: 20, unidad: 'un' },
      { nombre: 'Alcohol en Gel Sanitizante 70% 1L', codigoSKU: 'ALC-GEL-1L', categoria: 'Higiene Personal', precio: 1350.00, stockMinimo: 35, unidad: 'un' }
    ]);

    // ───  5. LOTES ENLAZADOS DINÁMICAMENTE (Datos para el algoritmo FEFO) ──────
    console.log(' Sembrando partidas de inventario con vencimientos escalonados...');
    const lotes = await Lote.create([
      // Lote 1 Lavandina: Queda muy poco stock físico para prender la alerta en el Dashboard
      {
        productoId: productos[0]._id,
        proveedorId: proveedores[0]._id,
        numeroLote: 'LOTE-LAV-001A',
        cantidadInicial: 50,
        cantidadActual: 5, // 5 unidades actuales < 40 unidades de mínimo -> ¡ALERTA CRÍTICA!
        fechaVencimiento: new Date('2026-08-15'), // Vence primero, sale primero por FEFO
        costoUnitario: 1200.00,
        ingresos: [],
        egresos: []
      },
      // Lote 2 Lavandina: Partida nueva que se resguarda en depósito
      {
        productoId: productos[0]._id,
        proveedorId: proveedores[0]._id,
        numeroLote: 'LOTE-LAV-002B',
        cantidadInicial: 100,
        cantidadActual: 100,
        fechaVencimiento: new Date('2027-02-20'),
        costoUnitario: 1200.00,
        ingresos: [],
        egresos: []
      },
      // Lotes Detergente: Partida vieja que expira pronto
      {
        productoId: productos[1]._id,
        proveedorId: proveedores[1]._id,
        numeroLote: 'LOTE-DET-VIEJO',
        cantidadInicial: 30,
        cantidadActual: 30,
        fechaVencimiento: new Date('2026-07-15'), // Próximo a vencer
        costoUnitario: 890.00,
        ingresos: [],
        egresos: []
      },
      {
        productoId: productos[1]._id,
        proveedorId: proveedores[1]._id,
        numeroLote: 'LOTE-DET-NUEVO',
        cantidadInicial: 100,
        cantidadActual: 100,
        fechaVencimiento: new Date('2026-12-31'),
        costoUnitario: 890.00,
        ingresos: [],
        egresos: []
      }
    ]);

    // ───  6. PEDIDO PENDIENTE DE PRUEBA ENLAZADO ──────────────────────────────
    console.log(' Confeccionando orden de venta inicial en cola logística...');
    const pedidos = await Pedido.create([
      {
        clienteId: clientes[0]._id,
        items: [
          {
            productoId: productos[1]._id, // Enlazado dinámicamente al detergente
            cantidad: 20,
            precioUnitario: 890.00
          }
        ],
        total: 17800.00,
        estado: "pendiente",
        observaciones: "Pedido de prueba inicial para validar el despacho controlado por FEFO."
      }
    ]);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(' ¡BASE DE DATOS INTEGRADA CARGADA CON ÉXITO EN LA NUBE!');
    console.log(`- Usuarios listos: ${usuarios.length} (Claves: admin1234, ventas1234, compras1234)`);
    console.log(`- Clientes cargados: ${clientes.length} | Proveedores: ${proveedores.length}`);
    console.log(`- Artículos de Limpieza: ${productos.length} | Lotes físicos: ${lotes.length}`);
    console.log(`- Órdenes en cola logística: ${pedidos.length}`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error(' Error crítico durante la carga de datos (Seed):', error);
    process.exit(1);
  }
}

seedDatabase();