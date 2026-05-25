const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middlewares/errorHandler');

// Configuración de variables de entorno
dotenv.config();

const app = express();

// Configuración del motor de vistas (Pug)
app.set('view engine', 'pug');
app.set('views', './src/views'); 

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Conexión asincrónica a MongoDB
connectDB();

// ─── INTERFAZ GRÁFICA (RAÍZ) ──────────────────────────────────────────────────
// Al montarse en '/' los endpoints internos (/productos, /clientes, /ventas)
// pasan a ser accesibles de forma directa en el navegador sin prefijos.
app.use('/', require('./src/routes/web.routes'));

// ─── API RESTFUL (DATOS JSON) ─────────────────────────────────────────────────
app.use('/api/productos', require('./src/routes/productos.routes'));
app.use('/api/proveedores', require('./src/routes/proveedores.routes'));
app.use('/api/clientes', require('./src/routes/clientes.routes'));
app.use('/api/inventario', require('./src/routes/inventario.routes'));
app.use('/api/compras', require('./src/routes/compras.routes'));
app.use('/api/ventas', require('./src/routes/ventas.routes'));
app.use('/api/cuentas', require('./src/routes/cuentas.routes'));

// Estado de cortesía de la API (solo responde si se consulta la raíz exacta sin rutas)
app.get('/', (req, res) => {
  res.json({
    mensaje: "API TodoStock - Backend 2° Parcial",
    estado: "Funcionando correctamente",
    baseDatos: "MongoDB + Mongoose",
    version: "1.0.0",
    grupo: "4 - Comisión D"
  });
});

// 💡 ENDPOINT DE AUTOMATIZACIÓN PARA PRUEBAS
// Permite al archivo pruebas.http consultar los IDs dinámicos generados en tiempo real
app.get('/api/pruebas/variables', (req, res) => {
  res.json({
    ordenCompraId: global.ordenCompraId || "REEMPLAZAR_CON_ID_DEVUELTO",
    pedidoVentaId: global.pedidoVentaId || "REEMPLAZAR_CON_ID_DEVUELTO"
  });
});

// Middleware de manejo de errores global (Debe ir SIEMPRE al final)
app.use(errorHandler);

// Inicialización del servidor HTTP
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\nTodoStock API corriendo en http://localhost:${PORT}`);
  console.log(`MongoDB: Conectado de forma asincrónica`);
  console.log(`Datos de prueba: ejecuta "node src/seed.js"`);
  console.log(`Interfaz gráfica directa disponible en:`);
  console.log(`- http://localhost:${PORT}/productos`);
  console.log(`- http://localhost:${PORT}/clientes`);
  console.log(`- http://localhost:${PORT}/ventas`);
  console.log(`- http://localhost:${PORT}/compras`);
  console.log(`- http://localhost:${PORT}/inventario`);
  console.log(`Usa Thunder Client o Postman para los endpoints de /api`);
  console.log(`═══════════════════════════════════════════════════════════════\n`);
});