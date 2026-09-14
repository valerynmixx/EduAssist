// ============================================================
// ARCHIVO: grados.js
// PARA QUE SIRVE:
//   Este archivo maneja todo lo relacionado con los GRADOS
//   escolares (Preescolar, Primero, Segundo, ... Undecimo).
//
//   Los grados se usan en varias partes de la aplicacion:
//   - En el formulario de estudiantes (para elegir el grado)
//   - En los filtros de novedades (para filtrar por grado)
//   - En las tablas (para mostrar el nombre del grado)
//
//   Por eso creamos este archivo separado, asi no repetimos
//   el mismo codigo en varios lugares.
// ============================================================


// Esta variable guarda la lista de grados que trajimos de
// Supabase, para no tener que pedirla otra vez cada vez que
// la necesitamos.
let listaGrados = [];


// ------------------------------------------------------------
// FUNCION: cargarGrados
// Trae todos los grados desde la tabla "grados" de Supabase
// y los guarda en la variable listaGrados.
// ------------------------------------------------------------
async function cargarGrados() {
  // Le pedimos a Supabase: "de la tabla grados, trae todas
  // las columnas (select *), ordenadas por id".
  const { data, error } = await supabase
    .from("grados")
    .select("*")
    .order("id", { ascending: true });

  // Si hubo un error de conexion, lo mostramos en la consola
  // y avisamos al usuario con una alerta.
  if (error) {
    console.error("Error al cargar los grados:", error);
    alert("No se pudieron cargar los grados.");
    return;
  }

  // Guardamos los grados obtenidos en nuestra variable global.
  listaGrados = data;
}


// ------------------------------------------------------------
// FUNCION: llenarSelectGrados
// Recibe el id de un elemento <select> del HTML y lo llena
// con una opcion por cada grado de listaGrados.
// ------------------------------------------------------------
function llenarSelectGrados(idSelect) {
  // Buscamos el elemento <select> en el HTML usando su id.
  const selectGrado = document.getElementById(idSelect);

  // Borramos las opciones que pudiera tener antes, y dejamos
  // una opcion inicial que dice "Seleccione un grado".
  selectGrado.innerHTML = '<option value="">Seleccione un grado</option>';

  // Recorremos cada grado de la lista y creamos una <option>
  // por cada uno, mostrando su nombre y guardando su id.
  listaGrados.forEach(function (grado) {
    const opcion = document.createElement("option");
    opcion.value = grado.id;
    opcion.textContent = grado.nombre;
    selectGrado.appendChild(opcion);
  });
}


// ------------------------------------------------------------
// FUNCION: obtenerNombreGrado
// Recibe el id de un grado y devuelve su nombre.
// Se usa para mostrar el nombre del grado en las tablas,
// en vez de mostrar solo el numero (id).
// ------------------------------------------------------------
function obtenerNombreGrado(gradoId) {
  // Buscamos dentro de listaGrados el grado que tenga ese id.
  const grado = listaGrados.find(function (g) {
    return g.id === gradoId;
  });

  // Si lo encontramos devolvemos su nombre, si no, devolvemos
  // un texto por defecto.
  return grado ? grado.nombre : "Sin grado";
}
