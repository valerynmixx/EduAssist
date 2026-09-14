<<<<<<< HEAD
# EduAssist
=======
# EduAssist - Control de Estudiantes

Proyecto educativo para registrar estudiantes y sus novedades académicas
(permisos, incapacidades y citas médicas). Está construido con **HTML,
CSS y JavaScript puro** (sin frameworks) y usa **Supabase** como base de
datos en la nube.

Este README explica cómo poner en marcha el proyecto desde cero.

---

## 1. Estructura del proyecto

```
EduAssist/
├── index.html              -> Única página HTML de la aplicación
├── css/
│   └── style.css           -> Todos los estilos (colores, tamaños, responsive)
├── js/
│   ├── config.js            -> Conexión con Supabase (URL y llave)
│   ├── grados.js             -> Funciones relacionadas con los grados
│   ├── estudiantes.js        -> CRUD de estudiantes
│   ├── novedades.js          -> CRUD de novedades
│   └── app.js                 -> Arranque de la app y menú lateral
├── sql/
│   └── script.sql            -> Script para crear la base de datos en Supabase
├── img/                        -> Carpeta para imágenes (vacía por defecto)
└── README.md
```

---

## 2. Crear la cuenta y el proyecto en Supabase

1. Entra a [https://supabase.com](https://supabase.com) y crea una cuenta
   gratuita (puedes usar tu cuenta de GitHub o Google).
2. Da clic en **"New Project"**.
3. Ponle un nombre al proyecto, por ejemplo `eduassist`.
4. Crea una contraseña para la base de datos (guárdala, la puedes
   necesitar más adelante) y elige la región más cercana.
5. Da clic en **"Create new project"** y espera unos minutos mientras
   Supabase prepara todo.

---

## 3. Ejecutar el script SQL

1. Dentro de tu proyecto de Supabase, ve al menú lateral y entra a
   **"SQL Editor"**.
2. Da clic en **"New query"**.
3. Abre el archivo [sql/script.sql](sql/script.sql) de este proyecto,
   copia todo su contenido y pégalo en el editor de Supabase.
4. Da clic en **"Run"** (o presiona Ctrl + Enter).
5. Si todo salió bien, verás un mensaje de éxito y en el menú
   **"Table Editor"** aparecerán las 4 tablas: `grados`, `estudiantes`,
   `tipos_novedad` y `novedades`, ya con los datos iniciales cargados.

---

## 4. Configurar las llaves de conexión

1. Dentro de tu proyecto de Supabase, ve a **Settings > API**.
2. Copia el valor de **"Project URL"**.
3. Copia el valor de **"anon public"** (dentro de "Project API keys").
4. Abre el archivo [js/config.js](js/config.js) de este proyecto y
   reemplaza los textos de ejemplo:

```javascript
const SUPABASE_URL = "AQUI_VA_LA_URL_DE_TU_PROYECTO";
const SUPABASE_KEY = "AQUI_VA_TU_LLAVE_PUBLICA";
```

por tus valores reales, por ejemplo:

```javascript
const SUPABASE_URL = "https://xxxxxxxxxxxx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9......";
```

5. Guarda el archivo.

> **Importante:** la llave `anon public` es una llave pública pensada
> para usarse desde el navegador, por eso no hay problema en escribirla
> directamente en el archivo `config.js`.

---

## 5. Abrir el proyecto

Como esta aplicación no usa Node.js ni ningún servidor, solo necesitas
abrir el archivo `index.html` en tu navegador:

- **Opción 1 (la más simple):** haz doble clic sobre `index.html`.
- **Opción 2 (recomendada):** si usas Visual Studio Code, instala la
  extensión **"Live Server"**, da clic derecho sobre `index.html` y
  selecciona **"Open with Live Server"**. Esto evita algunos problemas
  de seguridad del navegador y refresca la página automáticamente
  cuando guardas cambios.

---

## 6. Cómo funciona cada módulo

| Archivo | Qué hace |
|---|---|
| `js/config.js` | Crea la conexión (`supabase`) que usan todos los demás archivos para hablar con la base de datos. |
| `js/grados.js` | Trae la lista de grados desde Supabase y llena los `<select>` de grado en toda la aplicación. |
| `js/estudiantes.js` | Contiene el CRUD completo de estudiantes: listar, buscar, ordenar, guardar, editar y eliminar. |
| `js/novedades.js` | Contiene el CRUD completo de novedades (permisos, incapacidades, citas médicas), además de los filtros. |
| `js/app.js` | Arranca la aplicación al cargar la página, controla el menú lateral y calcula los contadores de la pantalla de Inicio. |

---

## 7. Restricciones del proyecto

Este proyecto fue diseñado a propósito de forma sencilla, sin usar:

- Frameworks de JavaScript (React, Angular, Vue)
- TypeScript
- Node.js ni Express
- PHP
- Bootstrap ni Tailwind
- jQuery
- SweetAlert (solo se usan `alert()` y `confirm()`)

El objetivo es que cualquier estudiante que esté aprendiendo HTML, CSS
y JavaScript pueda leer y entender el código completo.

---

## 8. Manual del estudiante

Si quieres entender **cómo funciona cada pieza del proyecto por dentro**
(qué hace HTML, qué hace CSS, qué hace JavaScript, cómo se conecta con
Supabase, cómo agregar un campo nuevo, etc.), revisa el archivo
[MANUAL_ESTUDIANTE.md](MANUAL_ESTUDIANTE.md).
>>>>>>> 87251a0 (Creando proyecto)
