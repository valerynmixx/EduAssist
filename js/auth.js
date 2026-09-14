// ============================================================
// ARCHIVO: auth.js
// PARA QUE SIRVE:
//   Maneja el inicio de sesion de la aplicacion. Hay tres roles:
//   - admin:      puede crear cuentas de profesor y acudiente
//                 (pantalla "Usuarios").
//   - profesor:   solo puede registrar novedades tipo "Permiso".
//   - acudiente:  solo puede registrar "Incapacidad" y "Cita Medica".
//
//   Las cuentas viven en la tabla "usuarios" de Supabase (ver
//   sql/migracion_usuarios.sql), no aqui en el codigo.
//
//   IMPORTANTE: este login es solo de INTERFAZ, pensado para un
//   proyecto educativo. Las contraseñas se comparan en texto
//   plano y la tabla "usuarios" queda con acceso publico igual
//   que las demas tablas, asi que alguien con conocimientos
//   tecnicos podria saltarselo o leerla directamente. No debe
//   usarse para proteger datos sensibles de verdad.
// ============================================================


// Que tipos de novedad puede REGISTRAR cada rol. El admin no
// aparece aqui: se revisa aparte (puede registrar cualquiera).
const TIPOS_PERMITIDOS_POR_ROL = {
  profesor: ["Permiso"],
  acudiente: ["Incapacidad", "Cita Medica"]
};

// Aqui guardamos el usuario que inicio sesion (o null si nadie
// ha entrado todavia).
let usuarioActual = null;


// ------------------------------------------------------------
// FUNCION: manejarLogin
// Se ejecuta al enviar el formulario de login. Busca en la
// tabla "usuarios" de Supabase una cuenta con ese usuario y
// esa clave exactos.
// ------------------------------------------------------------
async function manejarLogin(evento) {
  evento.preventDefault();

  const usuario = document.getElementById("input-usuario-login").value.trim();
  const clave = document.getElementById("input-clave-login").value;
  const mensajeError = document.getElementById("mensaje-error-login");

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("usuario", usuario)
    .eq("clave", clave)
    .maybeSingle();

  if (error) {
    console.error("Error al iniciar sesion:", error);
    mensajeError.textContent = "Ocurrio un error al iniciar sesion.";
    mensajeError.classList.remove("oculto");
    return;
  }

  if (!data) {
    mensajeError.textContent = "Usuario o contraseña incorrectos.";
    mensajeError.classList.remove("oculto");
    return;
  }

  mensajeError.classList.add("oculto");
  iniciarSesion(data);
}


// ------------------------------------------------------------
// FUNCION: iniciarSesion
// Guarda el usuario que entro (en la variable usuarioActual y
// en sessionStorage, para no pedir el login otra vez si recarga
// la pagina), muestra la aplicacion y arranca la carga de datos.
// ------------------------------------------------------------
function iniciarSesion(usuario) {
  usuarioActual = usuario;
  sessionStorage.setItem("usuarioActual", JSON.stringify(usuario));

  document.getElementById("pantalla-login").classList.add("oculto");
  document.getElementById("app-principal").classList.remove("oculto");
  document.getElementById("form-login").reset();

  mostrarInfoUsuario();
  aplicarVisibilidadPorRol();
  iniciarAplicacion();
}


// ------------------------------------------------------------
// FUNCION: cerrarSesion
// Borra la sesion guardada y vuelve a mostrar la pantalla de
// login.
// ------------------------------------------------------------
function cerrarSesion() {
  usuarioActual = null;
  sessionStorage.removeItem("usuarioActual");

  document.getElementById("app-principal").classList.add("oculto");
  document.getElementById("pantalla-login").classList.remove("oculto");
}


// ------------------------------------------------------------
// FUNCION: mostrarInfoUsuario
// Escribe en el encabezado el nombre y rol del usuario que
// inicio sesion.
// ------------------------------------------------------------
function mostrarInfoUsuario() {
  document.getElementById("texto-usuario-actual").textContent =
    usuarioActual.nombre + " (" + usuarioActual.rol + ")";
}


// ------------------------------------------------------------
// FUNCION: aplicarVisibilidadPorRol
// Muestra u oculta partes del menu segun el rol:
//   - Solo el admin ve el enlace a "Usuarios".
//   - El acudiente solo ve el enlace a "Novedades" (todo lo
//     demas queda oculto para el).
// ------------------------------------------------------------
function aplicarVisibilidadPorRol() {
  const itemUsuarios = document.getElementById("item-menu-usuarios");

  if (usuarioActual.rol === "admin") {
    itemUsuarios.classList.remove("oculto");
  } else {
    itemUsuarios.classList.add("oculto");
  }

  const itemsSoloParaOtrosRoles = [
    document.getElementById("item-menu-inicio"),
    document.getElementById("item-menu-estudiantes"),
    document.getElementById("item-menu-dashboard"),
    document.getElementById("item-menu-acerca")
  ];

  itemsSoloParaOtrosRoles.forEach(function (item) {
    if (usuarioActual.rol === "acudiente") {
      item.classList.add("oculto");
    } else {
      item.classList.remove("oculto");
    }
  });
}


// ------------------------------------------------------------
// FUNCION: restringirSelectTipoNovedadPorRol
// Quita del select "select-tipo-novedad" (el del formulario para
// crear una novedad nueva) las opciones que el rol actual NO
// puede registrar. El admin puede registrar cualquier tipo, asi
// que no se le quita nada. El select de filtro
// (select-filtro-tipo) tampoco se toca: cualquiera puede
// filtrar/ver todos los tipos.
// ------------------------------------------------------------
function restringirSelectTipoNovedadPorRol() {
  if (usuarioActual.rol === "admin") {
    return;
  }

  const tiposPermitidos = TIPOS_PERMITIDOS_POR_ROL[usuarioActual.rol] || [];
  const select = document.getElementById("select-tipo-novedad");

  Array.from(select.options).forEach(function (opcion) {
    // La opcion vacia ("Seleccione un tipo") siempre se deja.
    if (opcion.value === "") {
      return;
    }
    if (!tiposPermitidos.includes(opcion.textContent)) {
      opcion.remove();
    }
  });
}


// ------------------------------------------------------------
// FUNCION: obtenerIdsEstudiantesDelAcudiente
// Devuelve los id de los estudiantes que tienen asignada la
// cuenta del acudiente actual (campo usuario_acudiente_id).
// ------------------------------------------------------------
function obtenerIdsEstudiantesDelAcudiente() {
  return listaEstudiantes
    .filter(function (estudiante) {
      return estudiante.usuario_acudiente_id === usuarioActual.id;
    })
    .map(function (estudiante) {
      return estudiante.id;
    });
}


// ------------------------------------------------------------
// FUNCION: restringirSelectEstudiantePorRol
// Si el usuario actual es un acudiente, quita de los selects de
// estudiante (el de "Nueva Novedad" y el del filtro) a cualquier
// estudiante que no sea suyo. Los demas roles ven a todos.
// ------------------------------------------------------------
function restringirSelectEstudiantePorRol() {
  if (usuarioActual.rol !== "acudiente") {
    return;
  }

  const idsPropios = obtenerIdsEstudiantesDelAcudiente();

  ["select-estudiante-novedad", "select-filtro-estudiante"].forEach(function (idSelect) {
    const select = document.getElementById(idSelect);

    Array.from(select.options).forEach(function (opcion) {
      if (opcion.value === "") {
        return;
      }
      if (!idsPropios.includes(parseInt(opcion.value))) {
        opcion.remove();
      }
    });
  });
}


// ------------------------------------------------------------
// FUNCION: filtrarNovedadesPorRol
// Recibe una lista de novedades y, si el usuario actual es un
// acudiente, devuelve solo las que son de sus propios
// estudiantes. Los demas roles ven todas las novedades.
// ------------------------------------------------------------
function filtrarNovedadesPorRol(novedades) {
  if (usuarioActual.rol !== "acudiente") {
    return novedades;
  }

  const idsPropios = obtenerIdsEstudiantesDelAcudiente();

  return novedades.filter(function (novedad) {
    return idsPropios.includes(novedad.estudiante_id);
  });
}


// ------------------------------------------------------------
// FUNCION: verificarTipoNovedadPermitido
// Revisa que el tipo de novedad seleccionado en el formulario
// sea uno de los que el rol actual puede registrar. Sirve como
// segunda revision antes de guardar, ademas de que el select ya
// no muestra las opciones no permitidas. El admin siempre puede.
// ------------------------------------------------------------
function verificarTipoNovedadPermitido(tipoId) {
  if (usuarioActual.rol === "admin") {
    return true;
  }

  const tipo = listaTiposNovedad.find(function (t) {
    return t.id === parseInt(tipoId);
  });

  const tiposPermitidos = TIPOS_PERMITIDOS_POR_ROL[usuarioActual.rol] || [];
  return !!tipo && tiposPermitidos.includes(tipo.nombre);
}


// ------------------------------------------------------------
// EVENTO: DOMContentLoaded
// Si ya habia una sesion guardada (por ejemplo, si recargaron
// la pagina), entramos directo sin pedir el login otra vez.
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  const sesionGuardada = sessionStorage.getItem("usuarioActual");

  if (sesionGuardada) {
    iniciarSesion(JSON.parse(sesionGuardada));
  }
});
