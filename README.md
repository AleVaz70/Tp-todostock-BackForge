# TodoStock S.A. — Sistema de Gestión ERP y Logística FEFO (Entrega Final)

Este proyecto corresponde a la **Entrega Final (TP3)** de la solución de backend y arquitectura de sistemas para **TodoStock S.A.**, una distribuidora mayorista de productos de consumo masivo y desinfectantes industriales. 

El sistema está desarrollado bajo el patrón arquitectónico **MVC (Modelo-Vista-Controlador)** en capas, implementando un servidor HTTP modular con **Express**, persistencia escalable en la nube mediante **MongoDB Atlas y Mongoose**, y una interfaz de administración interactiva renderizada del lado del servidor (SSR) mediante el motor de plantillas **Pug** combinada con peticiones asincrónicas (**API Fetch / AJAX**).

## Nuevas Intervenciones de Ingeniería de Software (QA y Refactorización)
Para esta entrega final, la plataforma experimentó una fase rigurosa de control de calidad y reingeniería sobre el código base, implementando:
* **Consolidación Logística:** Unificación del ciclo de vida transaccional de órdenes de abastecimiento de tres estados controlados asincrónicamente.
* **Optimización Algorítmica:** Reestructuración de la consulta gerencial del Dashboard para mitigar "falsos positivos" mediante cálculos de stock real consolidado de partidas vigentes.
* **Mejora de la Experiencia de Usuario (UX):** Autocompletado inteligente de costos de catálogo en formularios y rediseño de grillas CSS proporcionales para evitar colapsos visuales.

---

## Integrantes del Grupo — Comisión D
* **Grupo:** 4 - **Comisión:** D
* **Integrantes:** Tomás Amsler, Rodrigo Berger, Gimena Escalante, Alejandra Vazquez 

---

## Arquitectura y Estructura del Proyecto (MVC)

El código fuente se encuentra organizado de forma modular para asegurar su escalabilidad, mantenibilidad y gobernanza de datos:

```text
todostock - PF3/
├── public/                 # Recursos estáticos (estilos CSS corporativos, iconos)
├── src/
│   ├── config/             # Configuración centralizada (Conexión asincrónica a MongoDB Atlas)
│   ├── controllers/        # Controladores (Cerebros de la lógica de negocio y despacho)
│   ├── middlewares/        # Middlewares (Filtros de seguridad 'protegerRuta' y manejo global de errores)
│   ├── models/             # Modelos de datos Mongoose (Esquemas estructurados de MongoDB)
│   ├── routes/             # Enrutamiento desacoplado por responsabilidades
│   │   ├── web.routes.js   # Enrutador de control de pantallas y vistas de interfaz (Pug)
│   │   └── *.routes.js     # Enrutadores de endpoints de servicios API REST (JSON)
│   ├── views/              # Plantillas modulares e indexadas del motor de vistas Pug (.pug)
│   └── seed.js             # Script sembrador/poblador asincrónico para la nube Cloud
├── .env                    # Variables de entorno corporativas (Seguridad de credenciales de red)
├── index.js                # Punto de entrada e inicialización principal de la aplicación
└── package.json            # Manifiesto de dependencias, metadatos y scripts de ejecución

Explicación Técnica y Reglas de Negocio Implementadas

1. Blindaje Automatizado del Margen Comercial (Recargo del 40%)
Para erradicar pérdidas asociadas a errores de facturación o la manipulación manual de precios en los puntos de venta, se anuló la asignación de precios por parte de la interfaz. Al registrar una orden de venta, el método crear del venta.controller.js realiza una consulta transaccional directa a la base de datos de MongoDB. El backend recupera el costo base homologado del producto y le inyecta un factor imperativo de multiplicación estricto de 1.40, asegurando un margen neto unificado para todas las transacciones mayoristas de la distribuidora.

2. Escudo Financiero Preventivo de Riesgo Crediticio (Cuentas Corrientes)
La asignación de deudas comerciales para clientes mayoristas está sujeta a un esquema de control preventivo:

 - Control en Frontend (Filtro de Interfaz): Al cargar el formulario web, el script analiza el saldo autorizado remanente expresado en el dropdown (Dispo: $X). Si el total acumulado en el pedido en curso supera este remanente, la interfaz rechaza la acción lanzando una alerta estéticamente estructurada de Control de Riesgo.

 - Validación Transaccional en Backend (Garantía de Consistencia): Si la petición eludiera la interfaz, el controlador de ventas ejecuta una validación de seguridad secundaria sumando el saldo deudor actual acumulado en el documento de MongoDB Atlas (cliente.saldo) más el totalNuevaVenta. Si el cálculo excede el cliente.limiteCredito, el servidor aborta la persistencia devolviendo un código de estado HTTP 400 Bad Request. Al despacharse la mercadería de forma definitiva, el saldo se actualiza de manera acumulativa: clienteBD.saldo = (clienteBD.saldo || 0) + pedido.total;.

3. Trazabilidad de Inventario Avanzado mediante Lógica Logística FEFO
Dada la naturaleza perecedera de insumos críticos como lavandinas y desinfectantes industriales, el control plano de existencias numéricas fue reemplazado por un modelo avanzado de datos segmentado por Lotes. Cada ingreso de stock proveniente de un proveedor homologado a través de una OrdenCompra genera un documento indexado con fecha de fabricación, lote y fechaVencimiento. Al ejecutarse la acción de despacho desde la grilla logística, se activa el algoritmo FEFO (First Expired, First Out). El proceso realiza una consulta ordenada de forma ascendente (sort({ fechaVencimiento: 1 })), garantizando el consumo imperativo de las partidas con fecha de caducidad más próxima.

4. Ciclo de Abastecimiento Controlado y Optimización de Alertas Gerenciales
- Flujo Transaccional de Reposición: El proceso de compra a proveedores homologados se estructuró bajo un flujo de estados mutables controlados asincrónicamente mediante verbos HTTP nativos (PATCH). La orden nace en estado pendiente (comprador), requiere la intervención de un perfil Administrador que ejecute la acción de Autorizar (mutando a estado aprobada para liberar la partida presupuestaria), y finalmente, al ingresar los camiones al depósito, el botón Recibir Mercadería cambia el estado de forma definitiva a recibida. Recién aquí el backend impacta físicamente la base de datos cloud, instanciando un nuevo documento en la colección de Lotes con sus fechas correspondientes y actualizando los tableros de inversión económica.

 - Mitigación de Falsos Positivos: La primera versión del Dashboard de inicio evaluaba los lotes de manera plana e individual, disparando alertas de desabastecimiento si existían registros históricos de partidas viejas con saldo cero o vencidas, ignorando que la distribuidora hubiese adquirido nuevos lotes con stock libre. Se refactorizó la consulta de la ruta /inicio implementando un esquema de stock consolidado real por producto. El backend ahora pre-filtra los datos aislando únicamente las partidas vigentes con mercadería real disponible (Lote.find({ cantidadActual: { $gt: 0 } })) y calcula la sumatoria total absoluta de cada artículo antes de contrastarlo contra el parámetro stockMinimo, garantizando reportes de control gerencial 100% verídicos.

 - Automatización de Costos en la Interfaz de Usuario (UX): Para evitar errores humanos de tipeo o desactualización de valores al confeccionar la reposición, se modificó el bucle del selector dinámico de artículos inyectando los metadatos de costos del catálogo maestro en la propiedad de datos HTML5 (data-precio=prod.precio). Mediante un escuchador de eventos de JavaScript (change), al seleccionar un producto, el formulario autocompleta instantáneamente el casillero de Costo Unitario ($) con el precio sugerido, manteniendo la flexibilidad de permitirle al comprador editar manualmente el campo si el proveedor aplicó un cambio de tarifa de último momento.

Mapa de Rutas del Ecosistema
Interfaz Gráfica de Navegación Directa (Vistas SSR Pug)
Panel de Control Principal (Dashboard): http://localhost:3000/inicio — Métricas financieras reales y control automatizado de alertas críticas de desabastecimiento por stock consolidado.

Catálogo Maestro de Productos: http://localhost:3000/productos — Sincronizado con el controlador central de reparaciones de stock.

Gestión de Clientes Mayoristas: http://localhost:3000/clientes — Control de cuentas corrientes y saldos financieros.

Panel de Abastecimiento Logístico: http://localhost:3000/compras — Confección, autorización y recepción física de órdenes de compra.

Control de Stock y Alertas FEFO: http://localhost:3000/inventario — Visualizador físico del depósito fraccionado por lotes con fechas de vencimiento visibles.

Ventas y Despachos: http://localhost:3000/ventas — Monitoreo de pedidos y despacho de mercancía al canal minorista.

Acceso Público de Autenticación: http://localhost:3000/login y /registrar.

Capa API RESTful (Datos JSON — Peticiones Asincrónicas)
Productos: GET, POST /api/productos

Clientes: GET, POST /api/clientes

Proveedores: GET, POST /api/proveedores

Inventario (Lotes): GET, POST /api/inventario

Compras (Abastecimiento): GET, POST /api/compras | Flujo de estados: PATCH /api/compras/:id/aprobar y /api/compras/:id/recibir

Ventas (Pedidos): GET, POST /api/ventas | Despacho FEFO: PATCH /api/ventas/:id/despachar

Roles y Responsabilidades del Equipo
Gimena Escalante: Diseño de la Arquitectura base, persistencia NoSQL distribuida y configuración centralizada de la base de datos cloud en MongoDB Atlas.

Rodrigo Berger: Programación del Módulo de Abastecimiento (Lógica de controladores para transiciones mutables de Órdenes de Compra y sincronización transaccional de Lotes).

Tomás Amsler: Programación del Módulo de Ventas (Desarrollo del algoritmo FEFO de descuento en cascada y validaciones de límites de crédito en cuenta corriente).

Alejandra Vazquez: Desarrollo de la Capa de Presentación (Frontend en plantillas Pug interconectadas asincrónicamente mediante API Fetch/AJAX) y control de aseguramiento de la calidad (QA, refactorización de dependencias e inyección de variables de entorno).

Tecnologías Utilizadas
Runtime: Node.js (v18+)

Framework Web: Express.js (Ruteo modular y middlewares personalizados de autorización)

Persistencia: MongoDB Atlas (Database-as-a-Service Cloud) + Mongoose ODM

Motor de Vistas: Pug (Server-Side Rendering integrado con manipulación asincrónica del DOM)

Configuración de Entorno: Dotenv (Aislamiento de credenciales criptográficas y variables de red)

Documentación Oficial de Tecnologías
Bootstrap. (s.f.). Documentación oficial de Bootstrap v5.3. https://getbootstrap.com/docs/5.3/getting-started/introduction/
Express.js. (s.f.). Documentación oficial de Express.js. https://expressjs.com/
Express-session – Manejo de sesiones. (s.f.). https://www.npmjs.com/package/express-session
JSON Web Tokens (JWT) – jwt.io. (s.f.). https://jwt.io/
jsonwebtoken (npm) – Implementación para Node. (s.f.). https://www.npmjs.com/package/jsonwebtoken
MongoDB Inc. (s.f.). Documentación oficial de MongoDB. https://www.mongodb.com/docs/
Mongoose ODM — Elegant MongoDB Object Modeling for Node.js. (s.f.). https://mongoosejs.com/docs/
Mozilla Developer Network (MDN). (s.f.). JavaScript – Referencia y guías. https://developer.mozilla.org/es/
Node.js Foundation. (s.f.). Node.js – Documentación oficial. https://nodejs.org/docs
Passport.js – Documentación oficial. (s.f.). https://www.passportjs.org/
Pug. (s.f.). Documentación oficial de Pug. https://pugjs.org/
Thunder Client. (s.f.). Documentación oficial de Thunder Client. Visual Studio Code Extension.

Apuntes Teóricos de la Cátedra (IFTS N° 29)
* Bloque 8.1 — Autenticación y Autorización en Node.js: Conceptos fundamentales de control de acceso, flujo de registro/login de usuarios y encriptación de contraseñas mediante hashing del lado del servidor.
* Bloque 8.2 — Middlewares de Seguridad y Control de Sesiones: Implementación de filtros intermedio personalizados para el blindaje de rutas privadas y persistencia del estado del usuario (Express-session / cookies) en el ecosistema web.
* Bloque 9.1 — Escalabilidad y Despliegue Cloud (Base de Datos Distribuida): Migración de persistencia local a entornos de producción en la nube utilizando MongoDB Atlas (Database-as-a-Service) y la gestión segura de variables de entorno (.env).

Instrucciones para la Corrección (Evaluación de Cátedra)
Para evaluar el proyecto de forma correcta en un entorno local, por favor abra una terminal en la raíz del proyecto (a la altura de la carpeta src) y ejecute el siguiente orden estricto de comandos:

1. Instalar dependencias externas y reparar módulos
Reconstruya los módulos e indexe las dependencias huérfanas de compilación de Pug descargando los paquetes necesarios mediante:

npm install

2. Configurar el archivo de Variables de Entorno

Cree un archivo llamado exactamente `.env` en la raíz del proyecto (a la altura de `src` e `index.js`) e inserte la estructura de conexión del Cluster Cloud de Atlas provista por el grupo:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb+srv://To.... (Nota: Reemplace con la dirección completa provista en la entrega de Google Drive)


3. Poblar la Base de Datos Cloud en la Nube (Obligatorio)
Ejecute el script sembrador. Este comando se conectará de manera asrincrónica a MongoDB Atlas, reseteará residuos previos para evitar colisiones de índices duplicados (como el codigoSKU) e inyectará el catálogo inicial sincronizado:

node src/seed.js

4. Iniciar el Servidor de Express
Levante la aplicación ejecutando el punto de entrada principal:

node index.js

Una vez inicializado, la consola le indicará el estado de conexión de Mongoose. Ya puede interactuar con el ecosistema comercial completo navegando por las interfaces de usuario o utilizando el archivo automatizado pruebas.http con la extensión REST Client de VS Code.

5. Credenciales de Acceso 

Para facilitar el proceso de corrección y auditoría de los diferentes niveles de autorización, se han precargado perfiles de prueba en el script sembrador (`seed.js`). Puede iniciar sesión directamente en `http://localhost:3000/login` utilizando los siguientes usuarios:

* **Perfil Administrador (Acceso Total, Autorización de Compras y Control Financiero):**
  * **Usuario:** `admin@todostock.com`
  * **Contraseña:** `admin1234`

* **Perfil Operario / Comprador (Gestión de Abastecimiento y Carga de Pedidos):**
  * **Usuario:** `compras@todostock.com`
  * **Contraseña:** `compras1234`

* **Perfil Operador Comercial / Ventas (Facturación, Aplicación del 40% y Control de Cuentas Corrientes):**
  * **Usuario:** `ventas@todostock.com`
  * **Contraseña:** `ventas1234` 
