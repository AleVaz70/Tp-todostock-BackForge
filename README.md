# 📦 TodoStock S.A. — Sistema de Gestión Mayorista (Parte 1)

## 🏢 Empresa de Desarrollo: BackForge — Comisión D
### 🎓 Cátedra: Desarrollo Web Backend (IFTS N° 29) — Año 2026

---

## 🚀 Repositorio Oficial del Proyecto
* **Vista Web del Repositorio:** [Repositorio TodoStock-BackForge](https://github.com/AleVaz70/Tp-todostock-BackForge)
* **URL de Clonación (Git Remoto):** `https://github.com/AleVaz70/Tp-todostock-BackForge.git`
* **Nube de Documentación:** [Carpeta Compartida en Google Drive](https://drive.google.com/drive/folders/1zP3RgAU9_Qp-HXe8Qxs9jzNkAz73m7d_?usp=drive_link)
* **Evidencia Funcional:** [Enlace al Video Demostrativo](https://drive.google.com/file/d/1oPB0NBBd-HMeK-LW95TRUHz95EeAHpyv/view?usp=drive_link)

---

## 👥 Integrantes y Responsabilidades
* **Gimena Escalante (Arquitectura y Configuración):** Estructura base del proyecto, configuración de `app.js`, middlewares globales y el motor de plantillas Pug.
* **Tomás Amsler (Módulo Productos):** Diseño del modelo, persistencia en storage, service, controladores y rutas del catálogo de productos. Middleware `validarId`.
* **Alejandra Vazquez (Módulo Ventas e Integración):** Lógica del flujo de pedidos de ventas, interacciones comerciales entre módulos y algoritmo de bloqueo preventivo de clientes.
* **Rodrigo Berger (Módulo Clientes y Frontend):** Programación del módulo de clientes, diseño de las vistas dinámicas con Pug (layouts, bucles y condicionales) y plan de pruebas de integración.

---

## 🎯 Descripción Funcional y Alcance Actual
El sistema está diseñado para la gestión operativa de una distribuidora mayorista familiar dedicada a la comercialización de artículos de limpieza. En esta primera instancia, el proyecto implementa una arquitectura **MVC (Modelo-Vista-Controlador)** desacoplada con 3 módulos principales:

1. **Catálogo de Productos:** Control estricto de artículos mediante identificadores únicos y códigos SKU obligatorios, precio y stock mínimo configurable.
2. **Cartera de Clientes:** Altas y modificaciones comerciales con validación de CUIT, límites crediticios y estado. Aplicación de la regla de **bloqueo y desbloqueo preventivo** en lugar de borrado físico para proteger el historial transaccional.
3. **Módulo de Ventas:** Generación de pedidos asimilando los datos de clientes y productos, con cálculo automatizado de importes y control de saldo crediticio en fase de despacho.

---

## 🗄️ Persistencia de Datos (Estructura JSON FileSystem)
La persistencia del sistema se realiza de forma local y 100% nativa en archivos planos planos de formato `.json` mediante el módulo sincrónico `fs` (`fs.readFileSync` y `fs.writeFileSync`), aislando los datos en la ruta `/data/`:
* `data/productos.json`: Almacenamiento del maestro de artículos de la distribuidora.
* `data/clientes.json`: Datos crediticios, CUIT y estados de actividad de la cartera.
* `data/ventas.json`: Matriz de transacciones, ítems solicitados, totales y estados (`pendiente` / `despachado`).

Cada archivo de almacenamiento (`storage.js`) gestiona los procesos encapsulados de `leer()`, `escribir(datos)` y la función predictiva de autoincremento `generarId(datos)`.

---

## 🚦 Capa de Middlewares Implementados
* **Middleware Global de Logging:** Registra cronológicamente en la terminal cada una de las peticiones entrantes detallando el método HTTP, la URL destino y la marca de tiempo exacta.
* **Middleware de Validación de Parámetros:** Intercepta las solicitudes por ruta para evaluar la sanidad de los parámetros numéricos (`id`) antes de derivar el flujo a los controladores, mitigando desbordamientos de lectura.

---

## 🔗 Mapa de Endpoints y Rutas del Sistema

### 🖥️ Interfaz Administrativa (Frontend SSR — Pug)
* **Catálogo General:** `GET /productos`
* **Administración de Clientes:** `GET /clientes`
* **Historial de Pedidos:** `GET /ventas`

### ⚙️ Capa API RESTful (Respuestas JSON)
* **Módulo Productos:** `GET` | `POST` a `/productos/api` y `PUT` | `DELETE` a `/productos/api/:id`
* **Módulo Clientes:** `GET` | `POST` a `/clientes/api` y `PATCH` a `/clientes/api/:id/bloquear` o `/clientes/api/:id/desbloquear`
* **Módulo Ventas:** `GET` | `POST` a `/ventas/api` y `PATCH` a `/ventas/api/:id/despachar` o `/ventas/api/:id/cancelar`

---

## 📚 Bibliografía Utilizada
* **Express.js — Framework Web Minimalista:** [Documentación Oficial](https://expressjs.com/es/)
* **Node.js — File System Module (`fs`):** [Documentación de Referencia API](https://nodejs.org/api/fs.html)
* **MDN Web Docs — Programación Orientada a Objetos en JavaScript:** [Guía de Clases](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Classes)
* **Contenidos de la Cátedra (IFTS N° 29):** Bloque 5 — "Middleware y motor de vistas Pug en Express".
