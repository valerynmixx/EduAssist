// ============================================================
// ARCHIVO: config.js
// PARA QUE SIRVE:
//   Este archivo conecta nuestra pagina web con la base de
//   datos de Supabase. Es el UNICO archivo donde deben ir las
//   llaves (URL y KEY) que Supabase nos entrega.
//
//   Todos los demas archivos (estudiantes.js, novedades.js,
//   grados.js, app.js) usan la variable "supabase" que se
//   crea aqui para poder leer y guardar datos.
// ============================================================


// SUPABASE_URL es la direccion de tu proyecto en Supabase.
// La encuentras en: Settings > API > Project URL
var SUPABASE_URL = "https://ivoagldxgeqdxpmxusyk.supabase.co";

// SUPABASE_KEY es la llave publica (anon key) de tu proyecto.
// La encuentras en: Settings > API > Project API keys > anon public
var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2b2FnbGR4Z2VxZHhwbXh1c3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NTE5MzEsImV4cCI6MjEwMDIyNzkzMX0.LdZGnBVDswfo6uRUhKmr-PXyml9CDLJf325fGd3KW0c";


// createClient() es una funcion que nos entrega la libreria de
// Supabase (la cargamos en index.html con una etiqueta <script>).
// Le pasamos la URL y la KEY, y ella nos devuelve un "cliente":
// un objeto que sabe como hablar con nuestra base de datos.
//
// Esta variable "supabase" se usara en TODOS los demas archivos
// JavaScript para hacer consultas (buscar, guardar, editar,
// eliminar) en las tablas de la base de datos.
//
// Usamos "window.supabase = ..." (en vez de "const supabase = ...")
// a proposito: la libreria de Supabase ya crea window.supabase con
// la funcion createClient. Si esta linea se vuelve a ejecutar (por
// ejemplo por una herramienta de recarga automatica del navegador),
// "const" lanzaria "Identifier already declared". Reasignar la
// propiedad de window no tiene ese problema.
//
// El "if" evita crear el cliente dos veces: si window.supabase ya
// es un cliente (tiene el metodo "from"), no lo volvemos a crear.
if (!window.supabase || typeof window.supabase.from !== "function") {
  window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
