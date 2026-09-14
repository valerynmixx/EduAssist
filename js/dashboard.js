// ============================================================
// ARCHIVO: dashboard.js
// PARA QUE SIRVE:
//   Este archivo dibuja el Dashboard: tarjetas con totales y
//   graficas de barras que resumen los datos de estudiantes y
//   novedades. No usa ninguna libreria externa de graficas, las
//   "barras" son simples <div> con su ancho calculado en JS.
// ============================================================


// Colores usados en las graficas. Los definimos aqui una sola
// vez para no repetir codigos de color por toda la funcion.
var COLOR_BARRA_UNICA = "#2a78d6"; // azul, para graficas de una sola serie
var COLORES_TIPO_NOVEDAD = ["#2a78d6", "#eb6834", "#1baf7a"]; // azul, naranja, aqua
var COLOR_ESTUDIANTE_ACTIVO = "#0ca30c"; // verde (estado "bueno")
var COLOR_ESTUDIANTE_INACTIVO = "#898781"; // gris (estado neutro)


// ------------------------------------------------------------
// FUNCION: calcularEstudiantesPorGrado
// Cuenta cuantos estudiantes hay en cada grado, en el mismo
// orden en que estan los grados (Preescolar a Undecimo).
// ------------------------------------------------------------
function calcularEstudiantesPorGrado() {
  return listaGrados.map(function (grado) {
    const cantidad = listaEstudiantes.filter(function (estudiante) {
      return estudiante.grado_id === grado.id;
    }).length;

    return { nombre: grado.nombre, cantidad: cantidad };
  });
}


// ------------------------------------------------------------
// FUNCION: calcularNovedadesPorTipo
// Cuenta cuantas novedades hay de cada tipo (Permiso,
// Incapacidad, Cita Medica).
// ------------------------------------------------------------
function calcularNovedadesPorTipo() {
  return listaTiposNovedad.map(function (tipo) {
    const cantidad = listaNovedades.filter(function (novedad) {
      return novedad.tipo_id === tipo.id;
    }).length;

    return { nombre: tipo.nombre, cantidad: cantidad };
  });
}


// ------------------------------------------------------------
// FUNCION: calcularEstudiantesPorEstado
// Cuenta cuantos estudiantes estan Activos y cuantos Inactivos.
// ------------------------------------------------------------
function calcularEstudiantesPorEstado() {
  const activos = listaEstudiantes.filter(function (estudiante) {
    return estudiante.estado === "Activo";
  }).length;

  const inactivos = listaEstudiantes.length - activos;

  return [
    { nombre: "Activos", cantidad: activos },
    { nombre: "Inactivos", cantidad: inactivos }
  ];
}


// ------------------------------------------------------------
// FUNCION: dibujarGraficaBarras
// Recibe el id de un contenedor, una lista de {nombre, cantidad}
// y una funcion que decide el color de cada barra. Dibuja una
// fila por cada dato: nombre a la izquierda, barra en medio y
// el numero a la derecha.
// ------------------------------------------------------------
function dibujarGraficaBarras(idContenedor, datos, obtenerColor) {
  const contenedor = document.getElementById(idContenedor);
  contenedor.innerHTML = "";

  // Si no hay datos, mostramos un mensaje en vez de una grafica vacia.
  if (datos.length === 0 || datos.every(function (d) { return d.cantidad === 0; })) {
    contenedor.innerHTML = "<p class='grafica-vacia'>Todavia no hay datos para mostrar.</p>";
    return;
  }

  // El valor mas alto define el 100% del ancho de las barras,
  // asi todas quedan proporcionales entre si.
  const maximo = Math.max.apply(null, datos.map(function (d) { return d.cantidad; }).concat([1]));

  datos.forEach(function (dato, indice) {
    const porcentaje = (dato.cantidad / maximo) * 100;

    const fila = document.createElement("div");
    fila.className = "fila-barra";

    const etiqueta = document.createElement("span");
    etiqueta.className = "etiqueta-barra";
    etiqueta.textContent = dato.nombre;

    const pista = document.createElement("div");
    pista.className = "pista-barra";
    pista.title = dato.nombre + ": " + dato.cantidad;

    const relleno = document.createElement("div");
    relleno.className = "relleno-barra";
    relleno.style.width = porcentaje + "%";
    relleno.style.backgroundColor = obtenerColor(dato, indice);
    pista.appendChild(relleno);

    const valor = document.createElement("span");
    valor.className = "valor-barra";
    valor.textContent = dato.cantidad;

    fila.appendChild(etiqueta);
    fila.appendChild(pista);
    fila.appendChild(valor);
    contenedor.appendChild(fila);
  });
}


// ------------------------------------------------------------
// FUNCION: dibujarLeyenda
// Dibuja los cuadritos de color con su nombre al lado, para
// que se sepa que color corresponde a cada categoria.
// ------------------------------------------------------------
function dibujarLeyenda(idContenedor, datos, colores) {
  const contenedor = document.getElementById(idContenedor);
  contenedor.innerHTML = "";

  datos.forEach(function (dato, indice) {
    const item = document.createElement("span");
    item.className = "leyenda-item";

    const punto = document.createElement("span");
    punto.className = "leyenda-punto";
    punto.style.backgroundColor = colores[indice % colores.length];

    item.appendChild(punto);
    item.appendChild(document.createTextNode(dato.nombre));
    contenedor.appendChild(item);
  });
}


// ------------------------------------------------------------
// FUNCION: actualizarDashboard
// Recalcula todo (tarjetas y graficas) a partir de los datos
// que ya tenemos cargados en listaEstudiantes, listaGrados,
// listaNovedades y listaTiposNovedad. Se llama cada vez que
// esos datos cambian (al cargar la app, o al guardar/eliminar
// un estudiante o una novedad).
// ------------------------------------------------------------
function actualizarDashboard() {
  const porGrado = calcularEstudiantesPorGrado();
  const porTipo = calcularNovedadesPorTipo();
  const porEstado = calcularEstudiantesPorEstado();

  // Tarjetas de totales.
  document.getElementById("dashboard-total-estudiantes").textContent = listaEstudiantes.length;
  document.getElementById("dashboard-estudiantes-activos").textContent = porEstado[0].cantidad;
  document.getElementById("dashboard-total-novedades").textContent = listaNovedades.length;

  const tipoMasComun = porTipo.slice().sort(function (a, b) {
    return b.cantidad - a.cantidad;
  })[0];
  document.getElementById("dashboard-tipo-comun").textContent =
    tipoMasComun && tipoMasComun.cantidad > 0 ? tipoMasComun.nombre : "N/A";

  // Graficas.
  dibujarGraficaBarras("grafica-estudiantes-grado", porGrado, function () {
    return COLOR_BARRA_UNICA;
  });

  dibujarGraficaBarras("grafica-novedades-tipo", porTipo, function (dato, indice) {
    return COLORES_TIPO_NOVEDAD[indice % COLORES_TIPO_NOVEDAD.length];
  });
  dibujarLeyenda("leyenda-novedades-tipo", porTipo, COLORES_TIPO_NOVEDAD);

  dibujarGraficaBarras("grafica-estudiantes-estado", porEstado, function (dato, indice) {
    return indice === 0 ? COLOR_ESTUDIANTE_ACTIVO : COLOR_ESTUDIANTE_INACTIVO;
  });
}
