# TodoStock S.A. — Sistema de Gestión

Aplicación web backend desarrollada con Node.js y Express para la gestión operativa de una distribuidora mayorista de artículos de limpieza.

Trabajo Práctico — Desarrollo Web Backend  
IFTS N° 29 — Tecnicatura Superior en Desarrollo de Software  
Grupo BackForge — Comisión D — Año 2026

## Integrantes

- Amsler, Tomás
- Berger, Rodrigo
- Escalante, Gimena
- Vazquez, Alejandra

## Módulos implementados

- **Productos** — catálogo con validación de SKU único y filtro por categoría
- **Clientes** — gestión con límite de crédito, bloqueo en lugar de eliminación
- **Ventas** — pedidos con verificación de crédito al despachar

## Tecnologías

- Node.js
- Express
- Pug (motor de vistas)
- JSON (persistencia de datos)

## Estructura del proyecto
 
```plaintext
todostock/
├── data/ → archivos JSON (persistencia)
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── storage/
├── views/ → plantillas Pug
└── app.js
```

## Cómo ejecutar

```bash
npm install
node app.js
```

La aplicación queda disponible en `http://localhost:3000`

## Vistas disponibles

| URL        | Descripción           |
|------------|-----------------------|
| /productos | Catálogo de productos |
| /clientes  | Listado de clientes   |
| /ventas    | Listado de pedidos    |

## Segunda entrega

Se incorporará MongoDB como base de datos, autenticación de usuarios y los módulos de Inventario, Compras y Cuentas Corrientes.
