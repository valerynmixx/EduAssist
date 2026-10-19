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

const BUCKET_ARCHIVOS_NOVEDADES = "novedad-archivos";
const TAMANO_MAXIMO_ARCHIVO_NOVEDAD = 10 * 1024 * 1024;


function mostrarArchivoSeleccionadoNovedad(input) {
  const archivo = input.files[0];
  const etiqueta = document.getElementById("nombre-archivo-novedad");

  if (archivo && archivo.size > TAMANO_MAXIMO_ARCHIVO_NOVEDAD) {
    alert("El archivo no puede superar los 10 MB.");
    input.value = "";
    etiqueta.textContent = "";
    return;
  }

  etiqueta.textContent = archivo ? "Seleccionado: " + archivo.name : "";
}


document.getElementById("input-archivo-novedad").addEventListener("change", function (evento) {
  mostrarArchivoSeleccionadoNovedad(evento.target);
});


function mostrarEnlaceArchivoNovedad(contenedor, novedad) {
  contenedor.innerHTML = "";

  if (!novedad || !novedad.archivo_path) {
    return;
  }

  const { data } = supabase.storage
    .from(BUCKET_ARCHIVOS_NOVEDADES)
    .getPublicUrl(novedad.archivo_path);
  const enlace = document.createElement("a");
  enlace.href = data.publicUrl;
  enlace.target = "_blank";
  enlace.rel = "noopener noreferrer";
  enlace.textContent = novedad.archivo_nombre || "Abrir archivo adjunto";
  contenedor.appendChild(enlace);
}


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
    .select("*, estudiantes(nombres, apellidos, documento, grado_id, telefono_acudiente), tipos_novedad(nombre)")
    .order("fecha_inicio", { ascending: false });

  if (error) {
    console.error("Error al listar novedades:", error);
    alert(
      "No se pudieron cargar las novedades.");
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
    cuerpoTabla.innerHTML = "<tr><td colspan='9'>No hay novedades registradas.</td></tr>";
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
    [
      nombreEstudiante,
      novedad.estudiantes ? novedad.estudiantes.telefono_acudiente || "-" : "-",
      nombreTipo,
      novedad.fecha_inicio,
      novedad.fecha_fin || "-"
    ].forEach(function (valor) {
      const celda = document.createElement("td");
      celda.textContent = valor;
      fila.appendChild(celda);
    });

    const celdaDescripcion = document.createElement("td");
    const descripcion = novedad.descripcion || "-";
    const textoDescripcion = document.createElement("span");
    textoDescripcion.className = "texto-descripcion-novedad";
    textoDescripcion.textContent = descripcion;
    celdaDescripcion.appendChild(textoDescripcion);

    const botonDescripcion = document.createElement("button");
    botonDescripcion.type = "button";
    botonDescripcion.className = "boton-expandir-descripcion";
    botonDescripcion.textContent = "▾";
    botonDescripcion.title = "Ver descripción completa";
    botonDescripcion.setAttribute("aria-label", "Ver descripción completa");
    botonDescripcion.setAttribute("aria-expanded", "false");
    botonDescripcion.hidden = true;
    botonDescripcion.addEventListener("click", function () {
      const expandida = textoDescripcion.classList.toggle("descripcion-expandida");
      botonDescripcion.textContent = expandida ? "▴" : "▾";
      botonDescripcion.title = expandida ? "Contraer descripción" : "Ver descripción completa";
      botonDescripcion.setAttribute("aria-label", botonDescripcion.title);
      botonDescripcion.setAttribute("aria-expanded", String(expandida));
    });
    celdaDescripcion.appendChild(botonDescripcion);
    fila.appendChild(celdaDescripcion);

    const celdaArchivo = document.createElement("td");
    if (novedad.archivo_path) {
      mostrarEnlaceArchivoNovedad(celdaArchivo, novedad);
    } else {
      celdaArchivo.textContent = "-";
    }
    fila.appendChild(celdaArchivo);

    const celdaEstado = document.createElement("td");
    const estado = novedad.estado || "Pendiente";
    const badgeEstado = document.createElement("span");
    badgeEstado.className = "badge-estado badge-estado-" + estado.toLowerCase();
    badgeEstado.textContent = estado;
    celdaEstado.appendChild(badgeEstado);
    fila.appendChild(celdaEstado);

    const celdaAcciones = document.createElement("td");
    const grupoAcciones = document.createElement("div");
    grupoAcciones.className = "acciones-novedad";

    if (usuarioActual.rol === "vigilante") {
      celdaAcciones.textContent = "-";
    } else if (usuarioActual.rol === "profesor" && estado === "Pendiente") {
      const botonAceptar = document.createElement("button");
      botonAceptar.type = "button";
      botonAceptar.className = "boton-accion";
      botonAceptar.textContent = "✓";
      botonAceptar.title = "Aceptar";
      botonAceptar.setAttribute("aria-label", "Aceptar");
      botonAceptar.addEventListener("click", function () {
        actualizarEstadoNovedad(novedad.id, "Aceptado");
      });

      const botonRechazar = document.createElement("button");
      botonRechazar.type = "button";
      botonRechazar.className = "boton-accion boton-eliminar";
      botonRechazar.textContent = "✕";
      botonRechazar.title = "Rechazar";
      botonRechazar.setAttribute("aria-label", "Rechazar");
      botonRechazar.addEventListener("click", function () {
        actualizarEstadoNovedad(novedad.id, "Rechazado");
      });

      grupoAcciones.append(botonAceptar, botonRechazar);
    } else if (usuarioActual.rol === "admin") {
      const botonEditar = document.createElement("button");
      botonEditar.type = "button";
      botonEditar.className = "boton-accion";
      botonEditar.textContent = "Editar";
      botonEditar.addEventListener("click", function () {
        prepararEdicionNovedad(novedad.id);
      });

      const botonEliminar = document.createElement("button");
      botonEliminar.type = "button";
      botonEliminar.className = "boton-accion boton-eliminar";
      botonEliminar.textContent = "Eliminar";
      botonEliminar.addEventListener("click", function () {
        eliminarNovedad(novedad.id);
      });

      grupoAcciones.append(botonEditar, botonEliminar);
    } else {
      celdaAcciones.textContent = "-";
    }
    if (grupoAcciones.childElementCount > 0) {
      celdaAcciones.appendChild(grupoAcciones);
    }
    fila.appendChild(celdaAcciones);

    cuerpoTabla.appendChild(fila);
    botonDescripcion.hidden = textoDescripcion.scrollWidth <= textoDescripcion.clientWidth;
  });
}


async function actualizarEstadoNovedad(idNovedad, nuevoEstado) {
  if (usuarioActual.rol !== "profesor") {
    alert("Solo un docente puede revisar las novedades.");
    return;
  }

  if (!["Aceptado", "Rechazado"].includes(nuevoEstado)) {
    alert("El estado seleccionado no es válido.");
    return;
  }

  const { error } = await supabase
    .from("novedades")
    .update({ estado: nuevoEstado })
    .eq("id", idNovedad);

  if (error) {
    console.error("Error al actualizar el estado de la novedad:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    if (error.code === "42703" && error.message.includes("estado")) {
      alert("La columna 'estado' no existe en Supabase. Ejecuta sql/migracion_estado_novedades.sql en el SQL Editor y vuelve a intentarlo.");
    } else {
      alert("No se pudo actualizar el estado de la novedad: " + (error.message || "Error desconocido"));
    }
    return;
  }

  await listarNovedades();
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
  const archivo = document.getElementById("input-archivo-novedad").files[0];

  if (archivo && archivo.size > TAMANO_MAXIMO_ARCHIVO_NOVEDAD) {
    alert("El archivo no puede superar los 10 MB.");
    return;
  }

  const datosNovedad = {
    estudiante_id: document.getElementById("select-estudiante-novedad").value,
    tipo_id: document.getElementById("select-tipo-novedad").value,
    fecha_inicio: document.getElementById("input-fecha-inicio-novedad").value,
    fecha_fin: document.getElementById("input-fecha-fin-novedad").value || null,
    descripcion: document.getElementById("input-descripcion-novedad").value.trim()
  };

  let rutaArchivoSubido = null;
  const novedadActual = idNovedad
    ? listaNovedades.find(function (novedad) { return String(novedad.id) === idNovedad; })
    : null;

  if (archivo) {
    const nombreSeguro = archivo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    rutaArchivoSubido = Date.now() + "-" + Math.random().toString(36).slice(2) + "-" + nombreSeguro;
    const { error: errorSubida } = await supabase.storage
      .from(BUCKET_ARCHIVOS_NOVEDADES)
      .upload(rutaArchivoSubido, archivo, { upsert: false });

    if (errorSubida) {
      console.error("Error al cargar el archivo de la novedad:", errorSubida);
      alert("No se pudo cargar el archivo: " + errorSubida.message);
      return;
    }

    datosNovedad.archivo_path = rutaArchivoSubido;
    datosNovedad.archivo_nombre = archivo.name;
  }

  let error;
  let novedadGuardada;

  if (idNovedad === "") {
    if (usuarioActual.rol === "acudiente") {
      datosNovedad.estado = "Pendiente";
    }
    const respuesta = await supabase
      .from("novedades")
      .insert([datosNovedad])
      .select("id, archivo_path")
      .single();
    error = respuesta.error;
    novedadGuardada = respuesta.data;
  } else {
    const respuesta = await supabase
      .from("novedades")
      .update(datosNovedad)
      .eq("id", idNovedad)
      .select("id, archivo_path")
      .maybeSingle();
    error = respuesta.error;
    novedadGuardada = respuesta.data;
  }

  if (error) {
    console.error("Error al guardar la novedad:", error);
    if (rutaArchivoSubido) {
      await supabase.storage.from(BUCKET_ARCHIVOS_NOVEDADES).remove([rutaArchivoSubido]);
    }
    if (error.code === "42703" && (error.message.includes("archivo_path") || error.message.includes("archivo_nombre"))) {
      alert("Faltan las columnas para adjuntos. Ejecuta sql/migracion_archivos_novedades.sql en Supabase y vuelve a intentarlo.");
    } else {
      alert("Ocurrio un error al guardar la novedad: " + (error.message || "Error desconocido"));
    }
    return;
  }

  if (!novedadGuardada || (archivo && novedadGuardada.archivo_path !== rutaArchivoSubido)) {
    if (rutaArchivoSubido) {
      await supabase.storage.from(BUCKET_ARCHIVOS_NOVEDADES).remove([rutaArchivoSubido]);
    }
    console.error("Supabase no confirmo la ruta del archivo en la novedad:", novedadGuardada);
    alert("No se pudo confirmar el archivo en la novedad. Recarga la lista y vuelve a intentarlo.");
    return;
  }

  if (rutaArchivoSubido && novedadActual && novedadActual.archivo_path) {
    const { error: errorEliminarArchivoAnterior } = await supabase.storage
      .from(BUCKET_ARCHIVOS_NOVEDADES)
      .remove([novedadActual.archivo_path]);
    if (errorEliminarArchivoAnterior) {
      console.error("No se pudo eliminar el archivo anterior:", errorEliminarArchivoAnterior);
    }
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
  document.getElementById("input-archivo-novedad").value = "";
  document.getElementById("nombre-archivo-novedad").textContent = "";
  mostrarEnlaceArchivoNovedad(document.getElementById("archivo-actual-novedad"), novedad);

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

  const novedad = listaNovedades.find(function (elemento) {
    return String(elemento.id) === String(idNovedad);
  });

  const { error } = await supabase.from("novedades").delete().eq("id", idNovedad);

  if (error) {
    console.error("Error al eliminar la novedad:", error);
    alert("No se pudo eliminar la novedad.");
    return;
  }

  if (novedad && novedad.archivo_path) {
    const { error: errorEliminarArchivo } = await supabase.storage
      .from(BUCKET_ARCHIVOS_NOVEDADES)
      .remove([novedad.archivo_path]);
    if (errorEliminarArchivo) {
      console.error("No se pudo eliminar el archivo adjunto:", errorEliminarArchivo);
    }
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
  document.getElementById("nombre-archivo-novedad").textContent = "";
  document.getElementById("archivo-actual-novedad").textContent = "";
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
