# Guía rápida para agentes AI — proyecto "inventario"

Objetivo corto: ayudar a un agente a ser productivo inmediatamente en este proyecto Node/Express + MongoDB que sirve una SPA estática desde `public/`.

- Punto de entrada: `server.js` importa `api/index.js` (Express app). `api/index.js` contiene la lógica de rutas y la conexión a MongoDB (Mongoose).
- Frontend estático: `public/` contiene `index.html`, `btnViewproducts.js`, `style.css`. El endpoint `/products` devuelve todos los productos y `/products` (POST) crea uno nuevo.
- Variables de entorno clave: `MONGODB_URI` (conexión a MongoDB Atlas), `PORT` (opcional, por defecto 5000). Se usan con `dotenv`.

Patrones y convenciones detectadas (útiles para cambios):
- Server single-file app: `api/index.js` combina configuración de middleware, modelo Mongoose y rutas. Evitar mover lógicas sin actualizar imports.
- Static-first UX: el frontend consume `GET /products` usando `fetch` (ver `public/btnViewproducts.js`). El cliente asume `localhost:3000` cuando `window.location.hostname === 'localhost'` — pero el servidor por defecto escucha en 5000; para desarrollar localmente abre `public/index.html` vía el servidor (http://localhost:5000/) o ajusta `btnViewproducts.js`.
- CORS: Configurado explícitamente en `api/index.js` con origenes permitidos `http://localhost:3000` y `https://vercel-prueba-ten.vercel.app`. Si pruebas desde `http://localhost:5000` (servidor Express), añade ese origen al arreglo.
- ES Modules: proyecto usa "type": "module" en `package.json`. Usa `import`/`export` y `fileURLToPath` para __dirname.

Acciones comunes y comandos (dev/debug):
- Arrancar en desarrollo (nodemon): `npm run dev` (usa `nodemon server.js`).
- Arrancar producción/local: `npm start` o `node server.js`.
- Para probar la API desde el navegador o curl, usa la URL base donde corre el servidor (por ejemplo `http://localhost:5000/products`).

Ejemplos concretos del código (guía para ediciones):
- Añadir campo al modelo Product: editar el `productSchema` en `api/index.js` y asegurarse de actualizar donde el frontend lee propiedades (`nombre`, `stock`, `price`, `img`).
- Cambiar CORS: editar el arreglo `origin` en `api/index.js` si tu cliente corre en un puerto distinto.
- Servir nuevos archivos estáticos: colocarlos en `public/` y referenciarlos desde `index.html`.

Problemas y notas observadas (no inventadas):
- `btnViewproducts.js` asume el backend en `http://localhost:3000` cuando `hostname==='localhost'` — sin embargo el servidor corre en 5000 por defecto. Para desarrollo, abrir la app desde `http://localhost:5000/` o actualizar el script del cliente para usar `location.port` o ruta relativa (`/products`).
- `package.json` incluye `nodemon` en `dependencies` (no devDependencies) — no crítico, pero se recomienda mover a `devDependencies`.

Cómo debo editar código (reglas para el agente):
- Mantén la sintaxis ES Modules y no conviertas a CommonJS.
- Si mueves el modelo a otro archivo, exporta/importa `Product` y actualiza cualquier referencia directa.
- Usa rutas relativas para archivos estáticos en `index.html` y `public/*`.

Puntos de integración externos:
- MongoDB Atlas: usar `MONGODB_URI` en entorno (ver `dotenv`).
- Vercel: `vercel.json` está presente; producción puede desplegar en Vercel. Evitar hardcodear URLs de Vercel en código fuente (usar variables o ruta relativa).

Dónde buscar más contexto:
- `package.json` — scripts y dependencias.
- `api/index.js` — modelo, rutas, CORS, static serving.
- `public/` — frontend y comportamiento JS (`btnViewproducts.js`).

Si algo no es claro, pide al humano: puerto de desarrollo preferido, orígenes CORS adicionales, y si quieren que actualice `btnViewproducts.js` para usar rutas relativas.

Fin de la guía.
