// ============================================================
// ARCHIVO: usuarios.js
// PARA QUE SIRVE:
//   Contiene el CRUD de la pantalla "Usuarios", donde el admin
//   puede crear y eliminar cuentas de profesor y acudiente.
//   Solo el admin ve esta seccion (ver auth.js).
// ============================================================


// Guardamos aqui la lista de usuarios que trajimos de Supabase
// (sin la contraseña, no la necesitamos para mostrarla en pantalla).
let listaUsuarios = [];


// ------------------------------------------------------------
// FUNCION: cargarUsuarios
// Trae todos los usuarios desde Supabase (menos la clave) y
// los muestra en la tabla.
// ------------------------------------------------------------
async function cargarUsuarios() {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nombre, usuario, rol")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error al cargar los usuarios:", error);
    alert("No se pudieron cargar los usuarios.");
    return;
  }

  listaUsuarios = data;
  mostrarUsuariosEnTabla(listaUsuarios);
}


// ------------------------------------------------------------
// FUNCION: llenarSelectAcudientes
// Recibe el id de un <select> del formulario de Estudiantes y
// lo llena con una opcion por cada cuenta de usuario que tenga
// rol "acudiente". Sirve para decir "este estudiante es hijo de
// esta cuenta", asi ese acudiente solo ve sus propias novedades.
// ------------------------------------------------------------
function llenarSelectAcudientes(idSelect) {
  const select = document.getElementById(idSelect);
  select.innerHTML = '<option value="">Sin acudiente asignado</option>';

  listaUsuarios
    .filter(function (usuario) {
      return usuario.rol === "acudiente";
    })
    .forEach(function (usuario) {
      const opcion = document.createElement("option");
      opcion.value = usuario.id;
      opcion.textContent = usuario.nombre + " (" + usuario.usuario + ")";
      select.appendChild(opcion);
    });
}


// ------------------------------------------------------------
// FUNCION: mostrarUsuariosEnTabla
// Dibuja una fila de tabla por cada usuario.
// ------------------------------------------------------------
function mostrarUsuariosEnTabla(usuarios) {
  const cuerpoTabla = document.getElementById("cuerpo-tabla-usuarios");
  cuerpoTabla.innerHTML = "";

  if (usuarios.length === 0) {
    cuerpoTabla.innerHTML = "<tr><td colspan='4'>No hay usuarios registrados.</td></tr>";
    return;
  }

  usuarios.forEach(function (usuario) {
    const fila = document.createElement("tr");
    fila.innerHTML =
      "<td>" + usuario.nombre + "</td>" +
      "<td>" + usuario.usuario + "</td>" +
      "<td>" + usuario.rol + "</td>" +
      "<td>" +
        "<button class='boton-accion boton-eliminar' onclick='eliminarUsuario(" + usuario.id + ")'>Eliminar</button>" +
      "</td>";
    cuerpoTabla.appendChild(fila);
  });
}


// ------------------------------------------------------------
// FUNCION: crearUsuario
// Se ejecuta al enviar el formulario de "Nuevo Usuario". Crea
// un profesor o un acudiente nuevo en la tabla "usuarios".
// ------------------------------------------------------------
async function crearUsuario(evento) {
  evento.preventDefault();

  const nombre = document.getElementById("input-nombre-usuario").value.trim();
  const usuario = document.getElementById("input-usuario-nuevo").value.trim();
  const clave = document.getElementById("input-clave-nuevo").value;
  const rol = document.getElementById("select-rol-usuario").value;

  if (nombre === "" || usuario === "" || clave === "" || rol === "") {
    alert("Debes llenar todos los campos.");
    return;
  }

  const { error } = await supabase
    .from("usuarios")
    .insert([{ nombre: nombre, usuario: usuario, clave: clave, rol: rol }]);

  if (error) {
    console.error("Error al crear el usuario:", error);
    if (error.code === "23505") {
      alert("Ya existe un usuario con ese nombre de usuario.");
    } else {
      alert("Ocurrio un error al crear el usuario.");
    }
    return;
  }

  alert("Usuario creado correctamente.");
  document.getElementById("form-usuario").reset();
  cargarUsuarios();
}


// ------------------------------------------------------------
// FUNCION: eliminarUsuario
// Pide confirmacion y borra un usuario. No deja que el admin
// se elimine a si mismo mientras tiene la sesion abierta.
// ------------------------------------------------------------
async function eliminarUsuario(idUsuario) {
  if (usuarioActual.id === idUsuario) {
    alert("No puedes eliminar tu propio usuario mientras tienes la sesion abierta.");
    return;
  }

  const confirmacion = confirm("¿Esta seguro que desea eliminar este usuario?");
  if (!confirmacion) {
    return;
  }

  const { error } = await supabase.from("usuarios").delete().eq("id", idUsuario);

  if (error) {
    console.error("Error al eliminar el usuario:", error);
    alert("No se pudo eliminar el usuario.");
    return;
  }

  alert("Usuario eliminado correctamente.");
  cargarUsuarios();
}
