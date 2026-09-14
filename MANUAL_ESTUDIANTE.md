# Manual del Estudiante - Entendiendo EduAssist

Este manual te explica, con tus propias palabras y de forma sencilla,
cómo funciona por dentro la aplicación EduAssist. Léelo con calma y
ábrelo junto con el código para que vayas comparando.

---

## 1. ¿Qué hace HTML?

HTML (HyperText Markup Language) es el **esqueleto** de la página.
Con HTML le decimos al navegador qué elementos existen: títulos,
párrafos, botones, formularios, tablas, etc.

Ejemplo del proyecto:

```html
<button class="boton" onclick="buscarEstudiante()">Buscar</button>
```

Esto crea un botón que dice "Buscar". El atributo `onclick` le dice al
navegador: "cuando hagan click aquí, ejecuta la función
`buscarEstudiante()`".

---

## 2. ¿Qué hace CSS?

CSS (Cascading Style Sheets) es el que le da **apariencia** al HTML:
colores, tamaños, espacios, bordes, y cómo se acomodan los elementos
en la pantalla.

Ejemplo del proyecto (`css/style.css`):

```css
.boton-principal {
  background-color: #1d4ed8;
  color: white;
}
```

Esto le dice al navegador: "todo elemento que tenga la clase
`boton-principal` debe pintarse de azul con letras blancas".

---

## 3. ¿Qué hace JavaScript?

JavaScript es el que le da **vida e inteligencia** a la página: puede
reaccionar a clicks, leer lo que el usuario escribe, hacer cálculos, y
lo más importante para nosotros: **hablar con la base de datos**.

Ejemplo del proyecto (`js/estudiantes.js`):

```javascript
async function eliminarEstudiante(idEstudiante) {
  const confirmacion = confirm("¿Esta seguro que desea eliminar este estudiante?");
  if (!confirmacion) {
    return;
  }
  const { error } = await supabase.from("estudiantes").delete().eq("id", idEstudiante);
  // ...
}
```

Aquí JavaScript le pregunta al usuario si está seguro (con `confirm`),
y si dice que sí, le pide a Supabase que borre ese estudiante.

---

## 4. ¿Qué es Supabase?

Supabase es un servicio en internet que nos da una **base de datos**
(en este caso, PostgreSQL) sin que nosotros tengamos que instalar ni
configurar un servidor. Es como tener una gran hoja de cálculo en la
nube, organizada en tablas, a la que nos podemos conectar desde
JavaScript usando su librería `supabase-js`.

En este proyecto tenemos 4 tablas:

- **grados**: los grados escolares (Preescolar, Primero, ...).
- **estudiantes**: los datos personales de cada estudiante.
- **tipos_novedad**: los tipos de novedad (Permiso, Incapacidad, Cita Médica).
- **novedades**: cada novedad registrada, conectada a un estudiante y a un tipo.

---

## 5. ¿Cómo funciona un CRUD?

CRUD significa **Crear, Leer, Actualizar y Borrar** (en inglés: Create,
Read, Update, Delete). Es el patrón que usamos para manejar datos:

| Letra | Acción | Función en el proyecto | Consulta a Supabase |
|---|---|---|---|
| C | Crear | `guardarEstudiante()` (cuando no hay id) | `supabase.from("estudiantes").insert([...])` |
| R | Leer | `listarEstudiantes()` | `supabase.from("estudiantes").select("*")` |
| U | Actualizar | `guardarEstudiante()` (cuando ya hay id) | `supabase.from("estudiantes").update({...}).eq("id", id)` |
| D | Borrar | `eliminarEstudiante()` | `supabase.from("estudiantes").delete().eq("id", id)` |

El mismo patrón se repite para las novedades en `js/novedades.js`.

---

## 6. ¿Cómo se conecta la aplicación con Supabase?

Todo empieza en `js/config.js`:

```javascript
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
```

1. `window.supabase` existe porque en `index.html` cargamos la librería
   de Supabase con una etiqueta `<script>` antes que nuestros archivos.
2. `createClient()` recibe la URL de nuestro proyecto y la llave
   pública, y nos devuelve un objeto llamado `supabase`.
3. Ese objeto `supabase` es como un "control remoto": lo usamos en
   `estudiantes.js`, `novedades.js` y `grados.js` para leer, insertar,
   actualizar y borrar datos, usando siempre el mismo patrón:

```javascript
supabase.from("nombre_de_la_tabla").select("*")   // leer
supabase.from("nombre_de_la_tabla").insert([...]) // crear
supabase.from("nombre_de_la_tabla").update({...}).eq("id", id) // actualizar
supabase.from("nombre_de_la_tabla").delete().eq("id", id)      // borrar
```

---

## 7. ¿Cómo agregar una tabla nueva?

Supongamos que quieres agregar una tabla de **Profesores**. Pasos:

1. En el `SQL Editor` de Supabase, crea la tabla:

```sql
create table profesores (
  id serial primary key,
  nombres text not null,
  materia text
);

alter table profesores enable row level security;

create policy "Acceso publico profesores" on profesores
  for all using (true) with check (true);
```

2. Crea un archivo nuevo `js/profesores.js` copiando la misma
   estructura de `js/estudiantes.js` (una función para listar, una para
   guardar, una para editar, una para eliminar).
3. Agrega la etiqueta `<script src="js/profesores.js"></script>` en
   `index.html`, después de `config.js`.
4. Agrega una nueva sección `<section id="seccion-profesores">` en el
   HTML con su formulario y su tabla, y un enlace nuevo en el menú
   lateral.

---

## 8. ¿Cómo modificar un formulario o agregar un campo nuevo?

Ejemplo: vamos a agregar el campo **"Correo electrónico"** al
formulario de estudiantes.

**Paso 1:** agrega la columna en Supabase (SQL Editor):

```sql
alter table estudiantes add column correo text;
```

**Paso 2:** agrega el campo en el HTML (`index.html`), dentro del
formulario de estudiantes:

```html
<div class="fila-formulario">
  <label for="input-correo">Correo:</label>
  <input type="text" id="input-correo">
</div>
```

**Paso 3:** en `js/estudiantes.js`, agrega el campo en 3 lugares:

1. Dentro de `datosEstudiante` (función `guardarEstudiante`):

```javascript
correo: document.getElementById("input-correo").value.trim(),
```

2. Dentro de `prepararEdicionEstudiante`, para que se muestre al editar:

```javascript
document.getElementById("input-correo").value = estudiante.correo || "";
```

3. Dentro de `limpiarFormularioEstudiante`, no necesitas hacer nada
   extra porque `form.reset()` ya limpia todos los campos del
   formulario automáticamente.

¡Y listo! Con esos 3 pasos puedes agregar cualquier campo nuevo a
cualquier formulario del proyecto.

---

## 9. Resumen de buenas prácticas usadas en este proyecto

- Cada función hace **una sola cosa** (por eso son cortas y fáciles de leer).
- Los nombres de variables y funciones son **descriptivos**
  (`listaEstudiantes`, no `x`; `guardarEstudiante()`, no `fn1()`).
- Todo el código está **comentado**, explicando el "para qué" de cada
  parte, no solo el "qué".
- Se validan los datos **antes** de guardarlos (campos obligatorios,
  documento repetido, fechas coherentes).
- Se usan `alert()` y `confirm()` para avisar y confirmar acciones
  importantes, como eliminar un registro.

Con estas bases, ya puedes leer cualquier archivo del proyecto y
entender exactamente qué hace cada línea.
