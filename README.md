# TodoStock S.A. — Sistema de Gestión de Depósito Mayorista (Backend)

Este proyecto corresponde al desarrollo de la solución de backend para **TodoStock S.A.**, una distribuidora mayorista de productos de consumo masivo. El sistema está diseñado bajo el paradigma de arquitectura en capas, implementando un servidor HTTP con **Express**, persistencia de datos orientada a documentos mediante **MongoDB** y **Mongoose**, y una interfaz de administración renderizada del lado del servidor con el motor de plantillas **Pug**.

La plataforma automatiza de manera integral el flujo de abastecimiento mediante compras por lotes (con trazabilidad bajo el criterio **FEFO** — *First Expired, First Out*) y el proceso de venta mayorista corporativa sujeto a validación rigurosa de reglas de negocio financieras (límites de crédito y saldos en cuentas corrientes).

---

## Integrantes del Grupo — Comisión D
* **Grupo:** BackForge - **Comisión:** D
* **Integrantes:** Tomás Amsler, 
                   Rodrigo Berger, 
                   Gimena Escalante, 
                   Alejandra Vazquez 

---

## Arquitectura y Estructura del Proyecto

El código se encuentra organizado de forma modular y estricta para asegurar su escalabilidad, mantenibilidad y evitar la sobreingeniería (*overengineering*):

```text
Distribuidora-Back/
├── public/                 # Recursos estáticos (estilos css, imágenes)
├── src/
│   ├── config/             # Configuración centralizada de servicios (Conexión Base de Datos Local)
│   ├── controllers/        # Controladores (Lógica de control y despacho de datos)
│   ├── middlewares/        # Middlewares de aplicación (Manejo de errores global y validaciones)
│   ├── models/             # Modelos de datos Mongoose (Esquemas de MongoDB)
│   ├── routes/             # Enrutadores divididos por capas (API RESTful y Rutas Web)
│   │   ├── web.routes.js   # Enrutador que maneja las vistas gráficas del frontend
│   │   └── *.routes.js     # Enrutadores de endpoints API JSON
│   ├── views/              # Plantillas del motor de vistas Pug (.pug)
│   └── seed.js             # Script sembrador/poblador asincrónico de base de datos local
├── .env                    # Variables de entorno locales (Puerto, URI de MongoDB Local)
├── index.js                # Punto de entrada principal de la aplicación
├── pruebas.http            # Plan de pruebas integral automatizado (REST Client)
└── package.json            # Manifiesto de dependencias y scripts de ejecución

Explicación Técnica y Reglas de Negocio Implementadas
El sistema no se limita a operaciones CRUD básicas, sino que orquesta procesos comerciales complejos mediante transacciones controladas y validaciones embebidas en los esquemas locales:

1. Gestión de Abastecimiento (Ciclo de Órdenes de Compra)
Las compras a proveedores estratégicos atraviesan un flujo de estados gobernado por lógica de control. Una orden nace como Pendiente. Al ser aprobada por la gerencia pasa a Aprobada, lo que congela las condiciones comerciales. Finalmente, al ingresar físicamente el camión al depósito, la orden pasa a Recibida.

Este último cambio gatilla de forma automática la creación y fraccionamiento de la mercadería en la colección de Lotes, impactando el stock físico y registrando las fechas de vencimiento correspondientes para la auditoría de calidad.

2. Algoritmo de Despacho Inteligente (Criterio FEFO)
Para optimizar la rotación de inventario y evitar mermas financieras por productos vencidos, el endpoint de despacho de ventas implementa el algoritmo FEFO (First Expired, First Out).

Cuando un pedido de venta se procesa, el sistema no descuenta el stock de manera global, sino que analiza la colección de lotes del producto solicitado, ordena los lotes activos por su fechaVencimiento de forma ascendente y debita las unidades estrictamente del lote cuya fecha de caducidad sea la más próxima en el tiempo. Si un lote no alcanza para cubrir el pedido, el algoritmo consume el saldo remanente saltando al siguiente lote con vencimiento inmediato posterior.

3. Control Financiero (Cuentas Corrientes y Límites de Crédito)
Las ventas mayoristas se operan bajo la modalidad de cuenta corriente comercial. Cada cliente corporativo posee un esquema con atributos estrictos de limiteCredito y saldo.

Antes de confirmar y autorizar cualquier pedido de venta, el backend ejecuta una validación transaccional: calcula el impacto del valor total del pedido actual sumado al saldo deudor vigente del cliente. Si esta proyección supera el limiteCredito otorgado al comercio, la operación es rechazada con un código 400 Bad Request, impidiendo el despacho de mercadería y protegiendo el flujo de caja de la distribuidora.

Mapa de Rutas del Ecosistema
Interfaz Gráfica (Navegador)
El sistema cuenta con un frontend unificado desarrollado en Pug que permite auditar el estado del negocio de forma directa. Al levantar el servidor de forma local, acceda a las siguientes secciones desde la barra de navegación superior:

Productos: http://localhost:3000/productos — Catálogo completo y control de precios base.

Clientes: http://localhost:3000/clientes — Base de datos de clientes y control de límites de crédito financieros.

Proveedores: http://localhost:3000/proveedores — Registro de fabricantes homologados, CUITs y plazos de entrega en días.

Stock / FEFO: http://localhost:3000/inventario — Control físico de depósito fraccionado por lotes con fechas de vencimiento visibles.

Órdenes Compra: http://localhost:3000/compras — Historial de abastecimiento mayorista y trazabilidad de estados de órdenes.

Pedidos Venta: http://localhost:3000/ventas — Monitoreo de pedidos y estado de despacho de mercancía al canal minorista.

Capa API RESTful (Datos JSON — Uso con Postman / Thunder Client)
Todos los endpoints devuelven respuestas estandarizadas en formato JSON y manejan códigos de estado HTTP semánticos:

Productos: GET, POST /api/productos

Clientes: GET, POST /api/clientes

Proveedores: GET, POST /api/proveedores

Inventario (Lotes): GET, POST /api/inventario | Alertas críticas: GET /api/inventario/alertas

Compras (Abastecimiento): GET, POST /api/compras | Flujo de estados: PATCH /api/compras/:id/aprobar y /api/compras/:id/recibir

Ventas (Pedidos): GET, POST /api/ventas | Despacho FEFO: PATCH /api/ventas/:id/despachar

Cuentas Corrientes: GET /api/cuentas

Roles y Responsabilidades del Equipo
Siguiendo las pautas organizacionales de la entrega, se detallan las responsabilidades asignadas:

Tomás Amsler: Diseño de la Arquitectura base y persistencia NoSQL local (Modelos de Mongoose y configuración de base de datos).

Rodrigo Berger: Programación del Módulo de Abastecimiento (Lógica de controladores para transiciones de Órdenes de Compra y Lotes).

Gimena Escalante: Programación del Módulo de Ventas (Desarrollo del algoritmo FEFO y validaciones de límites de crédito).

Alejandra Vazquez: Desarrollo de la Capa de Presentación (Frontend en plantillas Pug) y construcción del Plan de Pruebas automatizado.

Tecnologías
Runtime: Node.js (v18+)
Framework Web: Express.js (Middlewares locales y enrutamiento por capas)
Persistencia: MongoDB Community Server + Mongoose (ODM local)
Motor de Plantillas: Pug (Server-Side Rendering integrado)
Configuración: Dotenv (Variables de entorno)

Bibliografía Utilizada
### Documentación Oficial de Tecnologías

* **[Node.js Core Documentation](https://nodejs.org/docs/) (v18 LTS / v20 LTS):** Referencia para módulos nativos, asincronismo y manejo de flujos en el entorno de ejecución.
* **[Express.js Framework](https://expressjs.com/):** Guía oficial para ruteo modular, controladores, ciclo de vida de peticiones (`req`, `res`) y diseño de middlewares globales de manejo de errores.
* **[Mongoose ODM Documentation](https://mongoosejs.com/docs/):** Documentación técnica de referencia para la declaración de *Schemas*, tipos de datos, restricciones (`required`, `unique`), métodos de persistencia (`.save()`, `findByIdAndUpdate()`, `findByIdAndDelete()`) y vinculación documental (`.populate()`).
* **[Pug Template Engine](https://pugjs.org/):** Guía de referencia sintáctica para la herencia de plantillas (`extends`, `block`), renderizado de datos del lado del servidor (*Server-Side Rendering*) e iteración de colecciones NoSQL (`each...in`).

### Apuntes Teóricos de la Cátedra (IFTS N° 29)

* **Bloque 7.1 — Introducción a MongoDB:** Conceptos fundamentales de bases de datos NoSQL orientadas a documentos, equivalencias relacionales (SQL vs. NoSQL) e integración nativa con JavaScript.
* **Bloque 7.2 — Operadores de elementos y Schemas en MongoDB:** Reglas de validación estructural antes de la persistencia y control de consistencia de datos en operaciones CRUD.
* **Bloque 7.3 — Operadores en MongoDB:** Sintaxis y aplicación de operadores de comparación (`$gt`, `$gte`, `$lt`, `$lte`) y operadores lógicos (`$and`, `$or`) en la construcción de consultas avanzadas para la capa de lógica de negocio.

Instrucciones para la Corrección (Evaluación de Cátedra)
Para evaluar el proyecto de forma correcta en un entorno local, por favor abra una terminal en la raíz del proyecto y siga este orden estricto de comandos:

1. Instalar dependencias externas
Descargue los módulos de Node necesarios para el entorno ejecutando:

npm install

2. Poblar la Base de Datos Local (Obligatorio)
Ejecute el script sembrador. Este comando se conectará de manera asrincrónica a su servicio de MongoDB local, reseteará cualquier residuo previo de la base de datos todostock para evitar colisiones de índices duplicados (como el codigoSKU) e inyectará de forma fresca el catálogo inicial de productos, clientes corporativos, proveedores y lotes de prueba sincronizados milimétricamente con el archivo de pruebas:

node src/seed.js

3. Iniciar el Servidor de Express
Levante la aplicación ejecutando el punto de entrada:

node index.js

Una vez inicializado, la consola le indicará el estado de conexión de Mongoose. Ya puede interactuar con el ecosistema comercial completo navegando por las interfaces de usuario o utilizando el archivo automatizado pruebas.http con la extensión REST Client de VS Code.

