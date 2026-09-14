// ============================================================
// ARCHIVO: novedades.js
// PARA QUE SIRVE:
//   Este archivo contiene todo el CRUD (Crear, Leer, Actualizar
//   y Borrar) de las novedades: Permisos, Incapacidades y
//   Citas Medicas de los estudiantes.
//
//   Funciones principales:
//   - listarNovedades()          -> muestra todas las novedades en la tabla
//   - guardarNovedad()           -> guarda una novedad nueva o actualiza una existente
//   - prepararEdicionNovedad()   -> llena el formulario con los datos de una novedad
//   - eliminarNovedad()          -> borra una novedad
//   - filtrarNovedades()         -> filtra la tabla por estudiante, tipo o grado
// ============================================================


// Guardamos aqui la lista de novedades que trajimos de
// Supabase, para poder filtrar sin pedirla de nuevo.
let listaNovedades = [];

// Guardamos aqui la lista de tipos de novedad (Permiso,
// Incapacidad, Cita Medica).
let listaTiposNovedad = [];


// ------------------------------------------------------------
// FUNCION: cargarTiposNovedad
// Trae los tipos de novedad desde Supabase y los guarda en
// listaTiposNovedad.
// ------------------------------------------------------------
async function cargarTiposNovedad() {
  const { data, error } = await supabase
    .from("tipos_novedad")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error al cargar los tipos de novedad:", error);
    alert("No se pudieron cargar los tipos de novedad.");
    return;
  }

  listaTiposNovedad = data;
}


// ------------------------------------------------------------
// FUNCION: llenarSelectTiposNovedad
// Recibe el id de un <select> del HTML y lo llena con una
// opcion por cada tipo de novedad.
// ------------------------------------------------------------
function llenarSelectTiposNovedad(idSelect) {
  const select = document.getElementById(idSelect);
  select.innerHTML = '<option value="">Seleccione un tipo</option>';

  listaTiposNovedad.forEach(function (tipo) {
    const opcion = document.createElement("option");
    opcion.value = tipo.id;
    opcion.textContent = tipo.nombre;
    select.appendChild(opcion);
  });
}


// ------------------------------------------------------------
// FUNCION: llenarSelectEstudiantesNovedad
// Recibe el id de un <select> del HTML y lo llena con una
// opcion por cada estudiante (usa la lista que ya cargo
// estudiantes.js).
// ------------------------------------------------------------
function llenarSelectEstudiantesNovedad(idSelect) {
  const select = document.getElementById(idSelect);
  select.innerHTML = '<option value="">Seleccione un estudiante</option>';

  listaEstudiantes.forEach(function (estudiante) {
    const opcion = document.createElement("option");
    opcion.value = estudiante.id;
    opcion.textContent = estudiante.documento + " - " + estudiante.nombres + " " + estudiante.apellidos;
    select.appendChild(opcion);
  });
}


// ------------------------------------------------------------
// FUNCION: listarNovedades
// Trae todas las novedades desde Supabase. Ademas de los
// datos propios de la novedad, tambien trae "pegados" el
// nombre del estudiante y el nombre del tipo de novedad,
// gracias a las relaciones que creamos en el script SQL.
// ------------------------------------------------------------
async function listarNovedades() {
  const { data, error } = await supabase
    .from("novedades")
    .select("*, estudiantes(nombres, apellidos, documento, grado_id), tipos_novedad(nombre)")
    .order("fecha_inicio", { ascending: false });

  if (error) {
    console.error("Error al listar novedades:", error);
    alert("No se pudieron cargar las novedades.");
    return;
  }

  listaNovedades = data;
  mostrarNovedadesEnTabla(filtrarNovedadesPorRol(listaNovedades));
}


// ------------------------------------------------------------
// FUNCION: mostrarNovedadesEnTabla
// Recibe una lista de novedades y dibuja una fila de tabla
// por cada una.
// ------------------------------------------------------------
function mostrarNovedadesEnTabla(novedades) {
  const cuerpoTabla = document.getElementById("cuerpo-tabla-novedades");
  cuerpoTabla.innerHTML = "";

  if (novedades.length === 0) {
    cuerpoTabla.innerHTML = "<tr><td colspan='6'>No hay novedades registradas.</td></tr>";
    return;
  }

  novedades.forEach(function (novedad) {
    // "novedad.estudiantes" y "novedad.tipos_novedad" son los
    // datos relacionados que Supabase nos entrego junto con
    // la novedad, gracias a la consulta con relaciones.
    const nombreEstudiante = novedad.estudiantes
      ? novedad.estudiantes.nombres + " " + novedad.estudiantes.apellidos
      : "Estudiante eliminado";

    const nombreTipo = novedad.tipos_novedad ? novedad.tipos_novedad.nombre : "Sin tipo";

    const fila = document.createElement("tr");
    fila.innerHTML =
      "<td>" + nombreEstudiante + "</td>" +
      "<td>" + nombreTipo + "</td>" +
      "<td>" + novedad.fecha_inicio + "</td>" +
      "<td>" + (novedad.fecha_fin || "-") + "</td>" +
      "<td>" + (novedad.descripcion || "-") + "</td>" +
      "<td>" +
        "<button class='boton-accion' onclick='prepararEdicionNovedad(" + novedad.id + ")'>Editar</button> " +
        "<button class='boton-accion boton-eliminar' onclick='eliminarNovedad(" + novedad.id + ")'>Eliminar</button>" +
      "</td>";

    cuerpoTabla.appendChild(fila);
  });
}


// ------------------------------------------------------------
// FUNCION: validarFormularioNovedad
// Revisa que los campos obligatorios esten llenos y que la
// fecha de inicio no sea posterior a la fecha de fin.
// ------------------------------------------------------------
function validarFormularioNovedad() {
  const estudianteId = document.getElementById("select-estudiante-novedad").value;
  const tipoId = document.getElementById("select-tipo-novedad").value;
  const fechaInicio = document.getElementById("input-fecha-inicio-novedad").value;
  const fechaFin = document.getElementById("input-fecha-fin-novedad").value;

  if (estudianteId === "") {
    alert("Debe seleccionar un estudiante.");
    return false;
  }

  if (tipoId === "") {
    alert("Debe seleccionar un tipo de novedad.");
    return false;
  }

  if (fechaInicio === "") {
    alert("Debe ingresar la fecha de inicio.");
    return false;
  }

  // Si escribieron fecha de fin, revisamos que no sea antes
  // que la fecha de inicio.
  if (fechaFin !== "" && fechaFin < fechaInicio) {
    alert("La fecha fin no puede ser anterior a la fecha inicio.");
    return false;
  }

  return true;
}


// ------------------------------------------------------------
// FUNCION: guardarNovedad
// Se ejecuta al hacer click en "Guardar". Valida los datos y
// decide si debe crear una novedad nueva o actualizar una
// existente.
// ------------------------------------------------------------
async function guardarNovedad(evento) {
  evento.preventDefault();

  if (!validarFormularioNovedad()) {
    return;
  }

  // Revisamos que el rol del usuario actual (profesor o
  // acudiente) tenga permiso para registrar este tipo de
  // novedad. El select ya oculta las opciones no permitidas,
  // pero esta es una segunda revision antes de guardar.
  const tipoSeleccionado = document.getElementById("select-tipo-novedad").value;
  if (!verificarTipoNovedadPermitido(tipoSeleccionado)) {
    alert("Tu rol (" + usuarioActual.rol + ") no tiene permiso para registrar este tipo de novedad.");
    return;
  }

  const idNovedad = document.getElementById("input-id-novedad").value;

  const datosNovedad = {
    estudiante_id: document.getElementById("select-estudiante-novedad").value,
    tipo_id: document.getElementById("select-tipo-novedad").value,
    fecha_inicio: document.getElementById("input-fecha-inicio-novedad").value,
    fecha_fin: document.getElementById("input-fecha-fin-novedad").value || null,
    descripcion: document.getElementById("input-descripcion-novedad").value.trim()
  };

  let error;

  if (idNovedad === "") {
    const respuesta = await supabase.from("novedades").insert([datosNovedad]);
    error = respuesta.error;
  } else {
    const respuesta = await supabase
      .from("novedades")
      .update(datosNovedad)
      .eq("id", idNovedad);
    error = respuesta.error;
  }

  if (error) {
    console.error("Error al guardar la novedad:", error);
    alert("Ocurrio un error al guardar la novedad.");
    return;
  }

  alert("Novedad guardada correctamente.");
  limpiarFormularioNovedad();
  await listarNovedades();
  actualizarContadoresInicio();
  actualizarDashboard();
}


// ------------------------------------------------------------
// FUNCION: prepararEdicionNovedad
// Recibe el id de una novedad, busca sus datos y los pone
// dentro del formulario para poder editarlos.
// ------------------------------------------------------------
function prepararEdicionNovedad(idNovedad) {
  const novedad = listaNovedades.find(function (n) {
    return n.id === idNovedad;
  });

  if (!novedad) {
    alert("No se encontro la novedad.");
    return;
  }

  document.getElementById("input-id-novedad").value = novedad.id;
  document.getElementById("select-estudiante-novedad").value = novedad.estudiante_id;
  document.getElementById("select-tipo-novedad").value = novedad.tipo_id;
  document.getElementById("input-fecha-inicio-novedad").value = novedad.fecha_inicio;
  document.getElementById("input-fecha-fin-novedad").value = novedad.fecha_fin || "";
  document.getElementById("input-descripcion-novedad").value = novedad.descripcion || "";

  document.getElementById("boton-guardar-novedad").textContent = "Actualizar";
  document.getElementById("form-novedad").classList.remove("oculto");
}


// ------------------------------------------------------------
// FUNCION: eliminarNovedad
// Pide confirmacion y, si el usuario acepta, borra la
// novedad de la base de datos.
// ------------------------------------------------------------
async function eliminarNovedad(idNovedad) {
  const confirmacion = confirm("¿Esta seguro que desea eliminar esta novedad?");

  if (!confirmacion) {
    return;
  }

  const { error } = await supabase.from("novedades").delete().eq("id", idNovedad);

  if (error) {
    console.error("Error al eliminar la novedad:", error);
    alert("No se pudo eliminar la novedad.");
    return;
  }

  alert("Novedad eliminada correctamente.");
  await listarNovedades();
  actualizarContadoresInicio();
  actualizarDashboard();
}


// ------------------------------------------------------------
// FUNCION: limpiarFormularioNovedad
// Deja el formulario de novedades vacio y listo para
// registrar una novedad nueva.
// ------------------------------------------------------------
function limpiarFormularioNovedad() {
  document.getElementById("form-novedad").reset();
  document.getElementById("input-id-novedad").value = "";
  document.getElementById("boton-guardar-novedad").textContent = "Guardar";
}


// ------------------------------------------------------------
// FUNCION: filtrarNovedades
// Lee los filtros de estudiante, tipo y grado seleccionados
// por el usuario y muestra solo las novedades que coincidan.
// ------------------------------------------------------------
function filtrarNovedades() {
  const estudianteFiltro = document.getElementById("select-filtro-estudiante").value;
  const tipoFiltro = document.getElementById("select-filtro-tipo").value;
  const gradoFiltro = document.getElementById("select-filtro-grado").value;

  const novedadesFiltradas = filtrarNovedadesPorRol(listaNovedades).filter(function (novedad) {
    // Si el filtro de estudiante esta activo, comparamos el id.
    const coincideEstudiante = estudianteFiltro === "" || String(novedad.estudiante_id) === estudianteFiltro;

    // Si el filtro de tipo esta activo, comparamos el id.
    const coincideTipo = tipoFiltro === "" || String(novedad.tipo_id) === tipoFiltro;

    // Si el filtro de grado esta activo, comparamos el grado
    // del estudiante relacionado con la novedad.
    const gradoEstudiante = novedad.estudiantes ? String(novedad.estudiantes.grado_id) : "";
    const coincideGrado = gradoFiltro === "" || gradoEstudiante === gradoFiltro;

    return coincideEstudiante && coincideTipo && coincideGrado;
  });

  mostrarNovedadesEnTabla(novedadesFiltradas);
}


// ------------------------------------------------------------
// FUNCION: limpiarFiltrosNovedades
// Vuelve a dejar todos los filtros en blanco y muestra
// nuevamente todas las novedades.
// ------------------------------------------------------------
function limpiarFiltrosNovedades() {
  document.getElementById("select-filtro-estudiante").value = "";
  document.getElementById("select-filtro-tipo").value = "";
  document.getElementById("select-filtro-grado").value = "";
  mostrarNovedadesEnTabla(filtrarNovedadesPorRol(listaNovedades));
}
