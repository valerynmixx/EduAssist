// ============================================================
// ARCHIVO: app.js
// PARA QUE SIRVE:
//   Este archivo es el que "arranca" toda la aplicacion.
//
//   Se encarga de:
//   - Cargar los datos iniciales apenas abre la pagina
//     (grados, tipos de novedad, estudiantes y novedades)
//   - Llenar las listas desplegables (select) de toda la app
//   - Controlar el menu lateral (mostrar y ocultar secciones)
//   - Mostrar y ocultar los formularios
//   - Calcular los contadores de la pantalla de Inicio
// ============================================================


// ------------------------------------------------------------
// FUNCION: mostrarSeccion
// Recibe el nombre de una seccion ("inicio", "estudiantes",
// "novedades" o "acerca") y hace que solo esa seccion se vea
// en la pantalla, ocultando las demas.
// ------------------------------------------------------------
function mostrarSeccion(nombreSeccion) {
  // Buscamos todas las secciones de la pagina y las ocultamos.
  const todasLasSecciones = document.querySelectorAll(".seccion");
  todasLasSecciones.forEach(function (seccion) {
    seccion.classList.add("oculto");
  });

  // Mostramos unicamente la seccion que el usuario pidio.
  document.getElementById("seccion-" + nombreSeccion).classList.remove("oculto");

  // Marcamos como "activo" el enlace del menu correspondiente,
  // para que el usuario vea en cual seccion esta parado.
  const todosLosEnlaces = document.querySelectorAll(".enlace-menu");
  todosLosEnlaces.forEach(function (enlace) {
    enlace.classList.remove("activo");
  });
  document.getElementById("enlace-" + nombreSeccion).classList.add("activo");
}


// ------------------------------------------------------------
// FUNCION: mostrarFormularioNuevoEstudiante
// Limpia el formulario de estudiantes y lo muestra en
// pantalla, listo para registrar un estudiante nuevo.
// ------------------------------------------------------------
function mostrarFormularioNuevoEstudiante() {
  limpiarFormularioEstudiante();
  document.getElementById("form-estudiante").classList.remove("oculto");
}


// ------------------------------------------------------------
// FUNCION: cancelarFormularioEstudiante
// Se ejecuta al hacer click en el boton "Cancelar" del
// formulario de estudiantes. Limpia y oculta el formulario.
// ------------------------------------------------------------
function cancelarFormularioEstudiante() {
  limpiarFormularioEstudiante();
  document.getElementById("form-estudiante").classList.add("oculto");
}


// ------------------------------------------------------------
// FUNCION: mostrarFormularioNuevaNovedad
// Limpia el formulario de novedades y lo muestra en
// pantalla, listo para registrar una novedad nueva.
// ------------------------------------------------------------
function mostrarFormularioNuevaNovedad() {
  limpiarFormularioNovedad();
  document.getElementById("form-novedad").classList.remove("oculto");
}


// ------------------------------------------------------------
// FUNCION: cancelarFormularioNovedad
// Se ejecuta al hacer click en el boton "Cancelar" del
// formulario de novedades. Limpia y oculta el formulario.
// ------------------------------------------------------------
function cancelarFormularioNovedad() {
  limpiarFormularioNovedad();
  document.getElementById("form-novedad").classList.add("oculto");
}


// ------------------------------------------------------------
// FUNCION: contarNovedadesPorTipo
// Recibe el nombre de un tipo de novedad (por ejemplo
// "Permiso") y cuenta cuantas novedades de ese tipo existen
// dentro de listaNovedades.
// ------------------------------------------------------------
function contarNovedadesPorTipo(nombreTipo) {
  const novedadesDeEseTipo = listaNovedades.filter(function (novedad) {
    return novedad.tipos_novedad && novedad.tipos_novedad.nombre === nombreTipo;
  });

  return novedadesDeEseTipo.length;
}


// ------------------------------------------------------------
// FUNCION: actualizarContadoresInicio
// Calcula y muestra en la pantalla de Inicio: la cantidad de
// estudiantes, permisos, incapacidades y citas medicas.
// ------------------------------------------------------------
function actualizarContadoresInicio() {
  document.getElementById("contador-estudiantes").textContent = listaEstudiantes.length;
  document.getElementById("contador-permisos").textContent = contarNovedadesPorTipo("Permiso");
  document.getElementById("contador-incapacidades").textContent = contarNovedadesPorTipo("Incapacidad");
  document.getElementById("contador-citas").textContent = contarNovedadesPorTipo("Cita Medica");
}


// ------------------------------------------------------------
// FUNCION: iniciarAplicacion
// Esta es la funcion principal que arranca todo. Pide los
// datos a Supabase EN ORDEN (uno despues del otro, usando
// "await") porque unos datos dependen de otros. Por ejemplo,
// para llenar el select de estudiantes primero necesitamos
// haber cargado la lista de estudiantes.
// ------------------------------------------------------------
async function iniciarAplicacion() {
  // 1. Cargamos los grados y los tipos de novedad.
  await cargarGrados();
  await cargarTiposNovedad();

  // 2. Cargamos los estudiantes, las novedades y los usuarios
  // (la tabla de usuarios solo la ve el admin, pero cargarla
  // aqui es igual de simple que dejarla afuera).
  await listarEstudiantes();
  await listarNovedades();
  await cargarUsuarios();

  // 3. Llenamos todas las listas desplegables (select) de
  // la aplicacion con los datos que ya cargamos.
  llenarSelectGrados("select-grado-estudiante");
  llenarSelectGrados("select-filtro-grado");
  llenarSelectEstudiantesNovedad("select-estudiante-novedad");
  llenarSelectEstudiantesNovedad("select-filtro-estudiante");
  llenarSelectTiposNovedad("select-tipo-novedad");
  llenarSelectTiposNovedad("select-filtro-tipo");
  llenarSelectAcudientes("select-acudiente-estudiante");

  // 3.1 Segun el rol del usuario que inicio sesion:
  // - profesor/acudiente: se quitan del select de "Nueva Novedad"
  //   los tipos que no puede registrar.
  // - acudiente: los selects de estudiante solo muestran a SUS
  //   estudiantes (los que tienen su cuenta asignada), y la tabla
  //   de novedades solo muestra las de esos estudiantes.
  // Ver auth.js para el detalle de cada funcion.
  restringirSelectTipoNovedadPorRol();
  restringirSelectEstudiantePorRol();

  // 4. Calculamos los contadores de la pantalla de Inicio y
  // dibujamos las graficas del Dashboard.
  actualizarContadoresInicio();
  actualizarDashboard();

  // 5. Mostramos la primera pantalla al abrir la aplicacion. El
  // acudiente no tiene acceso a "Inicio" (solo ve Novedades), asi
  // que a el lo mandamos directo a Novedades.
  const seccionInicial = usuarioActual.rol === "acudiente" ? "novedades" : "inicio";
  mostrarSeccion(seccionInicial);
}

// NOTA: iniciarAplicacion() ya no se llama automaticamente al
// cargar la pagina. Ahora la dispara auth.js, una vez el usuario
// inicia sesion correctamente (o si ya tenia una sesion guardada).
