// ============================================================
// ARCHIVO: estudiantes.js
// PARA QUE SIRVE:
//   Este archivo contiene todo el CRUD (Crear, Leer, Actualizar
//   y Borrar) de los estudiantes.
//
//   Funciones principales:
//   - listarEstudiantes()      -> muestra todos los estudiantes en la tabla
//   - guardarEstudiante()      -> guarda un estudiante nuevo o actualiza uno existente
//   - prepararEdicionEstudiante() -> llena el formulario con los datos de un estudiante
//   - eliminarEstudiante()     -> borra un estudiante
//   - buscarEstudiante()       -> filtra los estudiantes por nombre, apellido o documento
// ============================================================


// Guardamos aqui la lista de estudiantes que trajimos de
// Supabase, para poder buscar y ordenar sin pedirla de nuevo.
let listaEstudiantes = [];


// ------------------------------------------------------------
// FUNCION: listarEstudiantes
// Trae todos los estudiantes desde Supabase y los muestra
// en la tabla del HTML.
// ------------------------------------------------------------
async function listarEstudiantes() {
  // Pedimos a Supabase todas las columnas de la tabla
  // "estudiantes", ordenadas por apellido.
  const { data, error } = await supabase
    .from("estudiantes")
    .select("*")
    .order("apellidos", { ascending: true });

  if (error) {
    console.error("Error al listar estudiantes:", error);
    alert("No se pudieron cargar los estudiantes.");
    return;
  }

  // Guardamos la lista completa y la mostramos en la tabla.
  listaEstudiantes = data;
  mostrarEstudiantesEnTabla(listaEstudiantes);
}


// ------------------------------------------------------------
// FUNCION: mostrarEstudiantesEnTabla
// Recibe una lista de estudiantes y dibuja una fila de tabla
// por cada uno.
// ------------------------------------------------------------
function mostrarEstudiantesEnTabla(estudiantes) {
  // Buscamos el <tbody> donde van las filas de la tabla.
  const cuerpoTabla = document.getElementById("cuerpo-tabla-estudiantes");

  // Lo vaciamos antes de dibujar las filas nuevas.
  cuerpoTabla.innerHTML = "";

  // Si no hay estudiantes, mostramos un mensaje.
  if (estudiantes.length === 0) {
    cuerpoTabla.innerHTML = "<tr><td colspan='6'>No hay estudiantes registrados.</td></tr>";
    return;
  }

  // Recorremos cada estudiante y creamos una fila de tabla.
  estudiantes.forEach(function (estudiante) {
    // Buscamos el nombre del grado usando la funcion de grados.js
    const nombreGrado = obtenerNombreGrado(estudiante.grado_id);

    // Creamos la fila con sus columnas y los botones de accion.
    const fila = document.createElement("tr");
    fila.innerHTML =
      "<td>" + estudiante.documento + "</td>" +
      "<td>" + estudiante.nombres + "</td>" +
      "<td>" + estudiante.apellidos + "</td>" +
      "<td>" + nombreGrado + "</td>" +
      "<td>" + estudiante.estado + "</td>" +
      "<td>" +
        "<button class='boton-accion' onclick='prepararEdicionEstudiante(" + estudiante.id + ")'>Editar</button> " +
        "<button class='boton-accion boton-eliminar' onclick='eliminarEstudiante(" + estudiante.id + ")'>Eliminar</button>" +
      "</td>";

    cuerpoTabla.appendChild(fila);
  });
}


// ------------------------------------------------------------
// FUNCION: ordenarEstudiantesPorNombre
// Ordena la lista de estudiantes alfabeticamente por nombres
// y vuelve a dibujar la tabla.
// ------------------------------------------------------------
function ordenarEstudiantesPorNombre() {
  listaEstudiantes.sort(function (a, b) {
    return a.nombres.localeCompare(b.nombres);
  });
  mostrarEstudiantesEnTabla(listaEstudiantes);
}


// ------------------------------------------------------------
// FUNCION: ordenarEstudiantesPorGrado
// Ordena la lista de estudiantes segun el nombre de su grado
// y vuelve a dibujar la tabla.
// ------------------------------------------------------------
function ordenarEstudiantesPorGrado() {
  listaEstudiantes.sort(function (a, b) {
    const nombreGradoA = obtenerNombreGrado(a.grado_id);
    const nombreGradoB = obtenerNombreGrado(b.grado_id);
    return nombreGradoA.localeCompare(nombreGradoB);
  });
  mostrarEstudiantesEnTabla(listaEstudiantes);
}


// ------------------------------------------------------------
// FUNCION: buscarEstudiante
// Lee el texto escrito en el buscador y muestra solo los
// estudiantes cuyo nombre, apellido o documento coincida.
// ------------------------------------------------------------
function buscarEstudiante() {
  // Tomamos el texto del buscador y lo pasamos a minusculas
  // para que la busqueda no distinga mayusculas de minusculas.
  const textoBuscado = document.getElementById("input-buscar-estudiante").value.toLowerCase();

  // Filtramos la lista completa de estudiantes.
  const estudiantesFiltrados = listaEstudiantes.filter(function (estudiante) {
    const nombreCompleto = (estudiante.nombres + " " + estudiante.apellidos).toLowerCase();
    const documento = estudiante.documento.toLowerCase();

    return nombreCompleto.includes(textoBuscado) || documento.includes(textoBuscado);
  });

  mostrarEstudiantesEnTabla(estudiantesFiltrados);
}


// ------------------------------------------------------------
// FUNCION: validarFormularioEstudiante
// Revisa que los campos obligatorios del formulario esten
// llenos. Si falta algo, muestra una alerta y devuelve false.
// ------------------------------------------------------------
function validarFormularioEstudiante() {
  const documento = document.getElementById("input-documento").value.trim();
  const nombres = document.getElementById("input-nombres").value.trim();
  const apellidos = document.getElementById("input-apellidos").value.trim();
  const fechaNacimiento = document.getElementById("input-fecha-nacimiento").value;
  const gradoId = document.getElementById("select-grado-estudiante").value;

  if (documento === "") {
    alert("Debe ingresar el documento del estudiante.");
    return false;
  }

  if (nombres === "") {
    alert("Debe ingresar los nombres del estudiante.");
    return false;
  }

  if (apellidos === "") {
    alert("Debe ingresar los apellidos del estudiante.");
    return false;
  }

  if (gradoId === "") {
    alert("Debe seleccionar un grado.");
    return false;
  }

  // Si escribieron fecha de nacimiento, revisamos que no sea una
  // fecha futura (un estudiante no puede haber nacido "mañana").
  const fechaHoy = new Date().toISOString().split("T")[0];
  if (fechaNacimiento !== "" && fechaNacimiento > fechaHoy) {
    alert("La fecha de nacimiento no puede ser una fecha futura.");
    return false;
  }

  // Si todo esta bien, la validacion pasa.
  return true;
}


// ------------------------------------------------------------
// FUNCION: existeDocumentoRepetido
// Revisa si el documento escrito ya pertenece a otro
// estudiante (diferente al que se esta editando).
// ------------------------------------------------------------
function existeDocumentoRepetido(documento, idEstudianteActual) {
  return listaEstudiantes.some(function (estudiante) {
    return estudiante.documento === documento && estudiante.id !== idEstudianteActual;
  });
}


// ------------------------------------------------------------
// FUNCION: guardarEstudiante
// Se ejecuta al hacer click en el boton "Guardar" o
// "Actualizar". Valida los datos y decide si debe crear un
// estudiante nuevo o actualizar uno existente.
// ------------------------------------------------------------
async function guardarEstudiante(evento) {
  // Evitamos que el formulario recargue la pagina.
  evento.preventDefault();

  // Si la validacion falla, no continuamos.
  if (!validarFormularioEstudiante()) {
    return;
  }

  // Leemos el id oculto: si tiene un valor, estamos editando;
  // si esta vacio, estamos creando un estudiante nuevo.
  const idEstudiante = document.getElementById("input-id-estudiante").value;

  // Armamos un objeto con los datos del formulario. Este
  // mismo objeto sirve tanto para crear como para actualizar.
  const datosEstudiante = {
    documento: document.getElementById("input-documento").value.trim(),
    nombres: document.getElementById("input-nombres").value.trim(),
    apellidos: document.getElementById("input-apellidos").value.trim(),
    fecha_nacimiento: document.getElementById("input-fecha-nacimiento").value || null,
    genero: document.getElementById("select-genero").value,
    direccion: document.getElementById("input-direccion").value.trim(),
    telefono: document.getElementById("input-telefono").value.trim(),
    acudiente: document.getElementById("input-acudiente").value.trim(),
    telefono_acudiente: document.getElementById("input-telefono-acudiente").value.trim(),
    usuario_acudiente_id: document.getElementById("select-acudiente-estudiante").value || null,
    grado_id: document.getElementById("select-grado-estudiante").value,
    estado: document.getElementById("select-estado-estudiante").value
  };

  // Validamos que el documento no este repetido.
  const idNumerico = idEstudiante ? parseInt(idEstudiante) : null;
  if (existeDocumentoRepetido(datosEstudiante.documento, idNumerico)) {
    alert("Ya existe un estudiante registrado con ese documento.");
    return;
  }

  let error;

  if (idEstudiante === "") {
    // No hay id: estamos creando un estudiante nuevo.
    const respuesta = await supabase.from("estudiantes").insert([datosEstudiante]);
    error = respuesta.error;
  } else {
    // Hay id: estamos actualizando un estudiante existente.
    const respuesta = await supabase
      .from("estudiantes")
      .update(datosEstudiante)
      .eq("id", idEstudiante);
    error = respuesta.error;
  }

  if (error) {
    console.error("Error al guardar el estudiante:", error);
    alert("Ocurrio un error al guardar el estudiante.");
    return;
  }

  alert("Estudiante guardado correctamente.");
  limpiarFormularioEstudiante();
  await listarEstudiantes();
  llenarSelectEstudiantesNovedad("select-estudiante-novedad");
  llenarSelectEstudiantesNovedad("select-filtro-estudiante");
  actualizarContadoresInicio();
  actualizarDashboard();
}


// ------------------------------------------------------------
// FUNCION: prepararEdicionEstudiante
// Recibe el id de un estudiante, busca sus datos y los pone
// dentro del formulario para poder editarlos.
// ------------------------------------------------------------
function prepararEdicionEstudiante(idEstudiante) {
  // Buscamos el estudiante dentro de la lista que ya tenemos.
  const estudiante = listaEstudiantes.find(function (e) {
    return e.id === idEstudiante;
  });

  if (!estudiante) {
    alert("No se encontro el estudiante.");
    return;
  }

  // Llenamos cada campo del formulario con los datos
  // del estudiante encontrado.
  document.getElementById("input-id-estudiante").value = estudiante.id;
  document.getElementById("input-documento").value = estudiante.documento;
  document.getElementById("input-nombres").value = estudiante.nombres;
  document.getElementById("input-apellidos").value = estudiante.apellidos;
  document.getElementById("input-fecha-nacimiento").value = estudiante.fecha_nacimiento || "";
  document.getElementById("select-genero").value = estudiante.genero || "";
  document.getElementById("input-direccion").value = estudiante.direccion || "";
  document.getElementById("input-telefono").value = estudiante.telefono || "";
  document.getElementById("input-acudiente").value = estudiante.acudiente || "";
  document.getElementById("input-telefono-acudiente").value = estudiante.telefono_acudiente || "";
  document.getElementById("select-acudiente-estudiante").value = estudiante.usuario_acudiente_id || "";
  document.getElementById("select-grado-estudiante").value = estudiante.grado_id;
  document.getElementById("select-estado-estudiante").value = estudiante.estado;

  // Cambiamos el texto del boton para indicar que ahora
  // estamos actualizando, no creando.
  document.getElementById("boton-guardar-estudiante").textContent = "Actualizar";

  // Mostramos el formulario por si estaba oculto.
  document.getElementById("form-estudiante").classList.remove("oculto");
}


// ------------------------------------------------------------
// FUNCION: eliminarEstudiante
// Pide confirmacion y, si el usuario acepta, borra el
// estudiante de la base de datos.
// ------------------------------------------------------------
async function eliminarEstudiante(idEstudiante) {
  const confirmacion = confirm("¿Esta seguro que desea eliminar este estudiante?");

  if (!confirmacion) {
    return;
  }

  const { error } = await supabase.from("estudiantes").delete().eq("id", idEstudiante);

  if (error) {
    console.error("Error al eliminar el estudiante:", error);
    alert("No se pudo eliminar el estudiante. Puede que tenga novedades registradas.");
    return;
  }

  alert("Estudiante eliminado correctamente.");
  await listarEstudiantes();
  llenarSelectEstudiantesNovedad("select-estudiante-novedad");
  llenarSelectEstudiantesNovedad("select-filtro-estudiante");
  actualizarContadoresInicio();
  actualizarDashboard();
}


// ------------------------------------------------------------
// FUNCION: limpiarFormularioEstudiante
// Deja el formulario de estudiantes vacio y listo para
// registrar un estudiante nuevo.
// ------------------------------------------------------------
function limpiarFormularioEstudiante() {
  document.getElementById("form-estudiante").reset();
  document.getElementById("input-id-estudiante").value = "";
  document.getElementById("boton-guardar-estudiante").textContent = "Guardar";
}
