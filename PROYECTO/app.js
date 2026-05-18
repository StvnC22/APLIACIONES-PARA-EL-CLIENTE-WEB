/* =========================================================
   SISTEMA DE TITULACIÓN
   Lógica principal del sistema
   ========================================================= */

/*
  Nota importante:
  - El sistema carga datos iniciales desde archivos CSV externos.
  - Luego guarda los cambios en LocalStorage para mantener la funcionalidad CRUD.
  - Para que fetch() lea los CSV locales, se recomienda abrir con Live Server.
*/

const STORAGE_KEY = "sistema_titulacion_funcional_v3";

const CSV_PATHS = {
  estudiantes: "data/estudiantes.csv",
  docentes: "data/docentes.csv",
  temas: "data/temas.csv",
  asignaciones: "data/asignaciones.csv",
  tutorias: "data/tutorias.csv",
  avances: "data/avances.csv"
};

let db = {
  estudiantes: [],
  docentes: [],
  temas: [],
  asignaciones: [],
  tutorias: [],
  avances: []
};

let ultimoReporte = [];

/* =========================================================
   EVENTOS INICIALES
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  configurarLogin();
  configurarNavegacion();
  configurarFormularios();
  configurarBuscadores();
  colocarFechasIniciales();
  cargarPreferenciaModoOscuro();
});

/* =========================================================
   LOGIN
   ========================================================= */

function configurarLogin() {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const usuario = document.getElementById("loginUsuario").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (usuario === "admin" && password === "12345") {
      document.getElementById("loginScreen").classList.add("hidden");
      document.getElementById("appScreen").classList.remove("hidden");

      await iniciarSistema();

      mostrarMensaje("Bienvenida al sistema.");
    } else {
      mostrarMensaje("Usuario o contraseña incorrectos.");
    }
  });
}

function cerrarSesion() {
  document.getElementById("appScreen").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");
}

/* =========================================================
   CARGA DE DATOS
   ========================================================= */

async function iniciarSistema() {
  const datosGuardados = localStorage.getItem(STORAGE_KEY);

  if (datosGuardados) {
    db = JSON.parse(datosGuardados);
    renderizarTodo();
    return;
  }

  await cargarDatosDesdeCSV();
}

async function cargarDatosDesdeCSV() {
  try {
    for (const coleccion of Object.keys(CSV_PATHS)) {
      const respuesta = await fetch(CSV_PATHS[coleccion]);
      const textoCSV = await respuesta.text();

      db[coleccion] = parseCSV(textoCSV);
    }

    guardarDatos();
    renderizarTodo();
  } catch (error) {
    console.error(error);
    mostrarMensaje("No se pudieron cargar los CSV. Use Live Server en Visual Studio Code.");
  }
}

async function recargarDatosDesdeCSV() {
  const confirmar = confirm(
    "Esto reemplazará los datos actuales por los datos iniciales de los CSV. ¿Desea continuar?"
  );

  if (!confirmar) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  await cargarDatosDesdeCSV();

  mostrarMensaje("Datos iniciales CSV recargados correctamente.");
}

function guardarDatos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

/* =========================================================
   NAVEGACIÓN
   ========================================================= */

function configurarNavegacion() {
  const botones = document.querySelectorAll(".menu-btn");

  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      mostrarSeccion(boton.dataset.section);
    });
  });
}

function mostrarSeccion(idSeccion) {
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active");
  });

  document.querySelectorAll(".menu-btn").forEach((boton) => {
    boton.classList.remove("active");
  });

  document.getElementById(idSeccion).classList.add("active");

  const botonActivo = document.querySelector(`[data-section="${idSeccion}"]`);

  if (botonActivo) {
    botonActivo.classList.add("active");
  }

  renderizarTodo();
}

/* =========================================================
   FORMULARIOS
   ========================================================= */

function configurarFormularios() {
  document.getElementById("formEstudiante").addEventListener("submit", guardarEstudiante);
  document.getElementById("formDocente").addEventListener("submit", guardarDocente);
  document.getElementById("formTema").addEventListener("submit", guardarTema);
  document.getElementById("formAsignacion").addEventListener("submit", guardarAsignacion);
  document.getElementById("formTutoria").addEventListener("submit", guardarTutoria);
  document.getElementById("formAvance").addEventListener("submit", guardarAvance);
}

function configurarBuscadores() {
  document.getElementById("buscarEstudiante").addEventListener("input", renderEstudiantes);
  document.getElementById("buscarDocente").addEventListener("input", renderDocentes);
}

function colocarFechasIniciales() {
  const fecha = obtenerFechaActual();

  const ids = [
    "fechaRegistro",
    "fechaPropuesta",
    "fechaAsignacion",
    "fechaTutoria",
    "fechaEntrega"
  ];

  ids.forEach((id) => {
    const elemento = document.getElementById(id);

    if (elemento && !elemento.value) {
      elemento.value = fecha;
    }
  });
}

/* =========================================================
   FUNCIONES AUXILIARES
   ========================================================= */

function obtenerFechaActual() {
  return new Date().toISOString().split("T")[0];
}

function siguienteId(coleccion, campoId) {
  if (!db[coleccion].length) {
    return 1;
  }

  const ids = db[coleccion].map((item) => Number(item[campoId] || item.id || 0));

  return Math.max(...ids) + 1;
}

function getEstudiante(idEstudiante) {
  return db.estudiantes.find((item) => Number(item.id_estudiante) === Number(idEstudiante));
}

function getDocente(idDocente) {
  return db.docentes.find((item) => Number(item.id_docente) === Number(idDocente));
}

function getTemaByEstudiante(idEstudiante) {
  return db.temas.find((item) => Number(item.id_estudiante) === Number(idEstudiante));
}

function getAsignacionByEstudiante(idEstudiante) {
  return db.asignaciones.find((item) => Number(item.id_estudiante) === Number(idEstudiante));
}

function getTutoriasByEstudiante(idEstudiante) {
  return db.tutorias.filter((item) => Number(item.id_estudiante) === Number(idEstudiante));
}

function getAvancesByEstudiante(idEstudiante) {
  return db.avances.filter((item) => Number(item.id_estudiante) === Number(idEstudiante));
}

function nombreEstudiante(idEstudiante) {
  const estudiante = getEstudiante(idEstudiante);

  if (!estudiante) {
    return "No encontrado";
  }

  return `${estudiante.nombres} ${estudiante.apellidos}`;
}

function nombreDocente(idDocente) {
  const docente = getDocente(idDocente);

  if (!docente) {
    return "No encontrado";
  }

  return docente.nombres;
}

/* =========================================================
   BADGES Y PROGRESO
   ========================================================= */

function badge(valor) {
  const texto = String(valor || "Sin dato");
  const lower = texto.toLowerCase();

  let clase = "neutral";

  if (
    lower.includes("aprobado") ||
    lower.includes("asignado") ||
    lower.includes("activo") ||
    lower.includes("asistió") ||
    lower.includes("entregado")
  ) {
    clase = "success";
  }

  if (
    lower.includes("pendiente") ||
    lower.includes("observado") ||
    lower.includes("sin tema")
  ) {
    clase = "warning";
  }

  if (
    lower.includes("rechazado") ||
    lower.includes("no asistió") ||
    lower.includes("retirado") ||
    lower.includes("inactivo")
  ) {
    clase = "danger";
  }

  if (
    lower.includes("proceso") ||
    lower.includes("corregido") ||
    lower.includes("reprogramado")
  ) {
    clase = "info";
  }

  return `<span class="badge ${clase}">${texto}</span>`;
}

function calcularProgreso(idEstudiante) {
  let progreso = 0;

  const tema = getTemaByEstudiante(idEstudiante);
  const asignacion = getAsignacionByEstudiante(idEstudiante);
  const tutorias = getTutoriasByEstudiante(idEstudiante);
  const avances = getAvancesByEstudiante(idEstudiante);

  if (tema) {
    progreso += tema.estado === "Aprobado" ? 25 : 12;
  }

  if (asignacion) {
    progreso += 15;
  }

  if (tutorias.length) {
    progreso += Math.min(25, tutorias.length * 5);
  }

  if (avances.length) {
    progreso += Math.min(25, avances.length * 8);
  }

  const trabajoFinal = avances.some((avance) => {
    return avance.tipo_documento === "Trabajo final" && avance.estado === "Aprobado";
  });

  if (trabajoFinal) {
    progreso = 100;
  }

  return Math.min(progreso, 100);
}

function barraProgreso(valor) {
  return `
    <div class="progress">
      <strong>${valor}%</strong>
      <div class="progress-bar">
        <span style="width: ${valor}%"></span>
      </div>
    </div>
  `;
}

/* =========================================================
   RENDER GENERAL
   ========================================================= */

function renderizarTodo() {
  llenarSelects();
  renderDashboard();
  renderEstudiantes();
  renderDocentes();
  renderTemas();
  renderAsignaciones();
  renderTutorias();
  renderAvances();
}

/* =========================================================
   SELECTS
   ========================================================= */

function llenarSelects() {
  const opcionesEstudiantes = `
  <option value="">Seleccione estudiante</option>
  ${db.estudiantes.map((item) => {
    return `
      <option value="${item.id_estudiante}">
        ${item.nombres} ${item.apellidos} - ${item.carrera} - ${item.nivel}
      </option>
    `;
  }).join("")}
`;

  const opcionesDocentes = `
    <option value="">Seleccione docente</option>
    ${db.docentes
      .filter((item) => item.estado === "Activo")
      .map((item) => {
        return `
          <option value="${item.id_docente}">
            ${item.nombres} - ${item.especialidad}
          </option>
        `;
      }).join("")}
  `;

  const selectsEstudiantes = [
    "temaEstudiante",
    "asignacionEstudiante",
    "tutoriaEstudiante",
    "avanceEstudiante"
  ];

  selectsEstudiantes.forEach((id) => {
    const select = document.getElementById(id);

    if (select) {
      const valorActual = select.value;
      select.innerHTML = opcionesEstudiantes;
      select.value = valorActual;
    }
  });

  const selectsDocentes = [
    "asignacionDocente",
    "tutoriaDocente"
  ];

  selectsDocentes.forEach((id) => {
    const select = document.getElementById(id);

    if (select) {
      const valorActual = select.value;
      select.innerHTML = opcionesDocentes;
      select.value = valorActual;
    }
  });
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {
  const conTema = db.estudiantes.filter((item) => getTemaByEstudiante(item.id_estudiante)).length;
  const sinTema = db.estudiantes.length - conTema;

  const pendientes = db.avances.filter((item) => {
    return item.estado === "Pendiente" || item.estado === "Observado";
  }).length;

  document.getElementById("statEstudiantes").textContent = db.estudiantes.length;
  document.getElementById("statDocentes").textContent = db.docentes.length;
  document.getElementById("statConTema").textContent = conTema;
  document.getElementById("statSinTema").textContent = sinTema;
  document.getElementById("statPendientes").textContent = pendientes;

  const filasDashboard = db.estudiantes.slice(0, 15).map((estudiante) => {
    const tema = getTemaByEstudiante(estudiante.id_estudiante);
    const asignacion = getAsignacionByEstudiante(estudiante.id_estudiante);
    const tutorias = getTutoriasByEstudiante(estudiante.id_estudiante);
    const avances = getAvancesByEstudiante(estudiante.id_estudiante);
    const docente = asignacion ? getDocente(asignacion.id_docente) : null;
    const progreso = calcularProgreso(estudiante.id_estudiante);

    return `
      <tr>
        <td>${estudiante.nombres} ${estudiante.apellidos}</td>
        <td>${estudiante.carrera}</td>
        <td>${estudiante.nivel}</td>
        <td>${tema ? badge(tema.estado) : badge("Sin tema")}</td>
        <td>${docente ? docente.nombres : badge("Sin tutor")}</td>
        <td>${tutorias.length}</td>
        <td>${avances.length}</td>
        <td>${barraProgreso(progreso)}</td>
      </tr>
    `;
  }).join("");

  document.getElementById("tablaDashboard").innerHTML = filasDashboard;

  document.getElementById("alertasDashboard").innerHTML = `
    <div class="alert blue">
      ${db.estudiantes.length} estudiantes registrados en el sistema.
    </div>

    <div class="alert green">
      ${conTema} estudiantes tienen tema registrado.
    </div>

    <div class="alert orange">
      ${sinTema} estudiantes aún no tienen tema.
    </div>

    <div class="alert red">
      ${pendientes} avances están pendientes u observados.
    </div>
  `;
}

/* =========================================================
   ESTUDIANTES
   ========================================================= */

function guardarEstudiante(event) {
  event.preventDefault();

  const id = document.getElementById("estudianteId").value;
  const cedula = document.getElementById("cedula").value.trim();

  const duplicado = db.estudiantes.find((item) => {
    return item.cedula === cedula && Number(item.id_estudiante) !== Number(id);
  });

  if (duplicado) {
    mostrarMensaje("Ya existe un estudiante con esa cédula.");
    return;
  }

  const estudiante = {
    id_estudiante: id ? Number(id) : siguienteId("estudiantes", "id_estudiante"),
    cedula: cedula,
    nombres: document.getElementById("nombres").value.trim(),
    apellidos: document.getElementById("apellidos").value.trim(),
    carrera: document.getElementById("carrera").value,
    nivel: document.getElementById("nivel").value,
    correo: document.getElementById("correo").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    estado: document.getElementById("estadoEstudiante").value,
    fecha_registro: document.getElementById("fechaRegistro").value || obtenerFechaActual()
  };

  if (id) {
    const index = db.estudiantes.findIndex((item) => {
      return Number(item.id_estudiante) === Number(id);
    });

    db.estudiantes[index] = estudiante;
    mostrarMensaje("Estudiante actualizado correctamente.");
  } else {
    db.estudiantes.push(estudiante);
    mostrarMensaje("Estudiante registrado correctamente.");
  }

  guardarDatos();
  limpiarFormEstudiante();
  renderizarTodo();
}

function renderEstudiantes() {
  const filtro = document.getElementById("buscarEstudiante").value.toLowerCase();

  const estudiantes = db.estudiantes.filter((item) => {
    const texto = `
      ${item.cedula}
      ${item.nombres}
      ${item.apellidos}
      ${item.carrera}
      ${item.nivel}
      ${item.estado}
    `.toLowerCase();

    return texto.includes(filtro);
  });

  const filas = estudiantes.map((item, index) => {
    const progreso = calcularProgreso(item.id_estudiante);

    return `
      <tr>
        <td>${index + 1}</td>
        <td>${item.cedula}</td>
        <td>${item.nombres}</td>
        <td>${item.apellidos}</td>
        <td>${item.carrera}</td>
        <td>${item.nivel}</td>
        <td>${badge(item.estado)}</td>
        <td>${barraProgreso(progreso)}</td>
        <td>
          <div class="actions">
            <button class="action-btn edit" onclick="editarEstudiante(${item.id_estudiante})">
              Editar
            </button>

            <button class="action-btn delete" onclick="eliminarRegistro('estudiantes', 'id_estudiante', ${item.id_estudiante})">
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  document.getElementById("tablaEstudiantes").innerHTML = filas;
}

function editarEstudiante(id) {
  const item = getEstudiante(id);

  document.getElementById("estudianteId").value = item.id_estudiante;
  document.getElementById("cedula").value = item.cedula;
  document.getElementById("nombres").value = item.nombres;
  document.getElementById("apellidos").value = item.apellidos;
  document.getElementById("carrera").value = item.carrera;
  document.getElementById("nivel").value = item.nivel;
  document.getElementById("correo").value = item.correo;
  document.getElementById("telefono").value = item.telefono;
  document.getElementById("estadoEstudiante").value = item.estado;
  document.getElementById("fechaRegistro").value = item.fecha_registro;

  mostrarSeccion("estudiantes");
  mostrarMensaje("Modo edición de estudiante activado.");
}

function limpiarFormEstudiante() {
  document.getElementById("formEstudiante").reset();
  document.getElementById("estudianteId").value = "";
  document.getElementById("fechaRegistro").value = obtenerFechaActual();
}

/* =========================================================
   DOCENTES
   ========================================================= */

function guardarDocente(event) {
  event.preventDefault();

  const id = document.getElementById("docenteId").value;

  const docente = {
    id_docente: id ? Number(id) : siguienteId("docentes", "id_docente"),
    cedula: document.getElementById("cedulaDocente").value.trim(),
    nombres: document.getElementById("nombresDocente").value.trim(),
    correo: document.getElementById("correoDocente").value.trim(),
    especialidad: document.getElementById("especialidadDocente").value.trim(),
    estado: document.getElementById("estadoDocente").value
  };

  if (id) {
    const index = db.docentes.findIndex((item) => {
      return Number(item.id_docente) === Number(id);
    });

    db.docentes[index] = docente;
    mostrarMensaje("Docente actualizado correctamente.");
  } else {
    db.docentes.push(docente);
    mostrarMensaje("Docente registrado correctamente.");
  }

  guardarDatos();
  limpiarFormDocente();
  renderizarTodo();
}

function renderDocentes() {
  const filtro = document.getElementById("buscarDocente").value.toLowerCase();

  const docentes = db.docentes.filter((item) => {
    const texto = `
      ${item.cedula}
      ${item.nombres}
      ${item.correo}
      ${item.especialidad}
      ${item.estado}
    `.toLowerCase();

    return texto.includes(filtro);
  });

  const filas = docentes.map((item, index) => {
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${item.cedula}</td>
        <td>${item.nombres}</td>
        <td>${item.correo}</td>
        <td>${item.especialidad}</td>
        <td>${badge(item.estado)}</td>
        <td>
          <div class="actions">
            <button class="action-btn edit" onclick="editarDocente(${item.id_docente})">
              Editar
            </button>

            <button class="action-btn delete" onclick="eliminarRegistro('docentes', 'id_docente', ${item.id_docente})">
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  document.getElementById("tablaDocentes").innerHTML = filas;
}

function editarDocente(id) {
  const item = getDocente(id);

  document.getElementById("docenteId").value = item.id_docente;
  document.getElementById("cedulaDocente").value = item.cedula;
  document.getElementById("nombresDocente").value = item.nombres;
  document.getElementById("correoDocente").value = item.correo;
  document.getElementById("especialidadDocente").value = item.especialidad;
  document.getElementById("estadoDocente").value = item.estado;

  mostrarSeccion("docentes");
  mostrarMensaje("Modo edición de docente activado.");
}

function limpiarFormDocente() {
  document.getElementById("formDocente").reset();
  document.getElementById("docenteId").value = "";
}

/* =========================================================
   TEMAS
   ========================================================= */

function guardarTema(event) {
  event.preventDefault();

  const id = document.getElementById("temaId").value;
  const idEstudiante = Number(document.getElementById("temaEstudiante").value);

  const temaDuplicado = db.temas.find((item) => {
    return Number(item.id_estudiante) === Number(idEstudiante) &&
           Number(item.id_tema) !== Number(id);
  });

  if (temaDuplicado) {
    mostrarMensaje("Este estudiante ya tiene un tema registrado.");
    return;
  }

  const tema = {
    id_tema: id ? Number(id) : siguienteId("temas", "id_tema"),
    id_estudiante: idEstudiante,
    titulo: document.getElementById("tituloTema").value.trim(),
    linea_investigacion: document.getElementById("lineaInvestigacion").value.trim(),
    descripcion: document.getElementById("descripcionTema").value.trim(),
    fecha_propuesta: document.getElementById("fechaPropuesta").value || obtenerFechaActual(),
    estado: document.getElementById("estadoTema").value,
    observaciones: document.getElementById("observacionesTema").value.trim()
  };

  if (id) {
    const index = db.temas.findIndex((item) => {
      return Number(item.id_tema) === Number(id);
    });

    db.temas[index] = tema;
    mostrarMensaje("Tema actualizado correctamente.");
  } else {
    db.temas.push(tema);
    mostrarMensaje("Tema registrado correctamente.");
  }

  guardarDatos();
  limpiarFormTema();
  renderizarTodo();
}

function renderTemas() {
  const filas = db.temas.map((item, index) => {
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${nombreEstudiante(item.id_estudiante)}</td>
        <td>${item.titulo}</td>
        <td>${item.linea_investigacion}</td>
        <td>${item.fecha_propuesta}</td>
        <td>${badge(item.estado)}</td>
        <td>
          <div class="actions">
            <button class="action-btn edit" onclick="editarTema(${item.id_tema})">
              Editar
            </button>

            <button class="action-btn delete" onclick="eliminarRegistro('temas', 'id_tema', ${item.id_tema})">
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  document.getElementById("tablaTemas").innerHTML = filas;
}

function editarTema(id) {
  const item = db.temas.find((tema) => {
    return Number(tema.id_tema) === Number(id);
  });

  document.getElementById("temaId").value = item.id_tema;
  document.getElementById("temaEstudiante").value = item.id_estudiante;
  document.getElementById("tituloTema").value = item.titulo;
  document.getElementById("lineaInvestigacion").value = item.linea_investigacion;
  document.getElementById("descripcionTema").value = item.descripcion;
  document.getElementById("fechaPropuesta").value = item.fecha_propuesta;
  document.getElementById("estadoTema").value = item.estado;
  document.getElementById("observacionesTema").value = item.observaciones;

  mostrarSeccion("temas");
  mostrarMensaje("Modo edición de tema activado.");
}

function limpiarFormTema() {
  document.getElementById("formTema").reset();
  document.getElementById("temaId").value = "";
  document.getElementById("fechaPropuesta").value = obtenerFechaActual();
}

/* =========================================================
   ASIGNACIONES
   ========================================================= */

function guardarAsignacion(event) {
  event.preventDefault();

  const id = document.getElementById("asignacionId").value;
  const idEstudiante = Number(document.getElementById("asignacionEstudiante").value);

  const asignacionDuplicada = db.asignaciones.find((item) => {
    return Number(item.id_estudiante) === Number(idEstudiante) &&
           Number(item.id_asignacion) !== Number(id);
  });

  if (asignacionDuplicada) {
    mostrarMensaje("Este estudiante ya tiene tutor asignado. Edite la asignación existente.");
    return;
  }

  const asignacion = {
    id_asignacion: id ? Number(id) : siguienteId("asignaciones", "id_asignacion"),
    id_estudiante: idEstudiante,
    id_docente: Number(document.getElementById("asignacionDocente").value),
    fecha_asignacion: document.getElementById("fechaAsignacion").value || obtenerFechaActual(),
    estado: document.getElementById("estadoAsignacion").value,
    observaciones: document.getElementById("observacionesAsignacion").value.trim()
  };

  if (id) {
    const index = db.asignaciones.findIndex((item) => {
      return Number(item.id_asignacion) === Number(id);
    });

    db.asignaciones[index] = asignacion;
    mostrarMensaje("Asignación actualizada correctamente.");
  } else {
    db.asignaciones.push(asignacion);
    mostrarMensaje("Tutor asignado correctamente.");
  }

  guardarDatos();
  limpiarFormAsignacion();
  renderizarTodo();
}

function renderAsignaciones() {
  const filas = db.asignaciones.map((item, index) => {
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${nombreEstudiante(item.id_estudiante)}</td>
        <td>${nombreDocente(item.id_docente)}</td>
        <td>${item.fecha_asignacion}</td>
        <td>${badge(item.estado)}</td>
        <td>
          <div class="actions">
            <button class="action-btn edit" onclick="editarAsignacion(${item.id_asignacion})">
              Editar
            </button>

            <button class="action-btn delete" onclick="eliminarRegistro('asignaciones', 'id_asignacion', ${item.id_asignacion})">
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  document.getElementById("tablaAsignaciones").innerHTML = filas;
}

function editarAsignacion(id) {
  const item = db.asignaciones.find((asignacion) => {
    return Number(asignacion.id_asignacion) === Number(id);
  });

  document.getElementById("asignacionId").value = item.id_asignacion;
  document.getElementById("asignacionEstudiante").value = item.id_estudiante;
  document.getElementById("asignacionDocente").value = item.id_docente;
  document.getElementById("fechaAsignacion").value = item.fecha_asignacion;
  document.getElementById("estadoAsignacion").value = item.estado;
  document.getElementById("observacionesAsignacion").value = item.observaciones;

  mostrarSeccion("asignaciones");
  mostrarMensaje("Modo edición de asignación activado.");
}

function limpiarFormAsignacion() {
  document.getElementById("formAsignacion").reset();
  document.getElementById("asignacionId").value = "";
  document.getElementById("fechaAsignacion").value = obtenerFechaActual();
}

/* =========================================================
   TUTORÍAS
   ========================================================= */

function guardarTutoria(event) {
  event.preventDefault();

  const id = document.getElementById("tutoriaId").value;

  const tutoria = {
    id_tutoria: id ? Number(id) : siguienteId("tutorias", "id_tutoria"),
    id_estudiante: Number(document.getElementById("tutoriaEstudiante").value),
    id_docente: Number(document.getElementById("tutoriaDocente").value),
    fecha: document.getElementById("fechaTutoria").value,
    hora: document.getElementById("horaTutoria").value,
    modalidad: document.getElementById("modalidadTutoria").value,
    tema_tratado: document.getElementById("temaTratado").value.trim(),
    actividades: document.getElementById("actividadesTutoria").value.trim(),
    compromisos: document.getElementById("compromisosTutoria").value.trim(),
    proxima_tutoria: document.getElementById("proximaTutoria").value,
    asistencia: document.getElementById("asistenciaTutoria").value,
    observaciones: document.getElementById("observacionesTutoria").value.trim()
  };

  if (id) {
    const index = db.tutorias.findIndex((item) => {
      return Number(item.id_tutoria) === Number(id);
    });

    db.tutorias[index] = tutoria;
    mostrarMensaje("Tutoría actualizada correctamente.");
  } else {
    db.tutorias.push(tutoria);
    mostrarMensaje("Tutoría registrada correctamente.");
  }

  guardarDatos();
  limpiarFormTutoria();
  renderizarTodo();
}

function renderTutorias() {
  const filas = db.tutorias.map((item, index) => {
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${nombreEstudiante(item.id_estudiante)}</td>
        <td>${nombreDocente(item.id_docente)}</td>
        <td>${item.fecha} ${item.hora || ""}</td>
        <td>${item.modalidad}</td>
        <td>${badge(item.asistencia)}</td>
        <td>${item.tema_tratado}</td>
        <td>
          <div class="actions">
            <button class="action-btn edit" onclick="editarTutoria(${item.id_tutoria})">
              Editar
            </button>

            <button class="action-btn delete" onclick="eliminarRegistro('tutorias', 'id_tutoria', ${item.id_tutoria})">
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  document.getElementById("tablaTutorias").innerHTML = filas;
}

function editarTutoria(id) {
  const item = db.tutorias.find((tutoria) => {
    return Number(tutoria.id_tutoria) === Number(id);
  });

  document.getElementById("tutoriaId").value = item.id_tutoria;
  document.getElementById("tutoriaEstudiante").value = item.id_estudiante;
  document.getElementById("tutoriaDocente").value = item.id_docente;
  document.getElementById("fechaTutoria").value = item.fecha;
  document.getElementById("horaTutoria").value = item.hora;
  document.getElementById("modalidadTutoria").value = item.modalidad;
  document.getElementById("asistenciaTutoria").value = item.asistencia;
  document.getElementById("temaTratado").value = item.tema_tratado;
  document.getElementById("actividadesTutoria").value = item.actividades;
  document.getElementById("compromisosTutoria").value = item.compromisos;
  document.getElementById("proximaTutoria").value = item.proxima_tutoria;
  document.getElementById("observacionesTutoria").value = item.observaciones;

  mostrarSeccion("tutorias");
  mostrarMensaje("Modo edición de tutoría activado.");
}

function limpiarFormTutoria() {
  document.getElementById("formTutoria").reset();
  document.getElementById("tutoriaId").value = "";
  document.getElementById("fechaTutoria").value = obtenerFechaActual();
}

/* =========================================================
   AVANCES
   ========================================================= */

function guardarAvance(event) {
  event.preventDefault();

  const id = document.getElementById("avanceId").value;

  const avance = {
    id_avance: id ? Number(id) : siguienteId("avances", "id_avance"),
    id_estudiante: Number(document.getElementById("avanceEstudiante").value),
    numero_avance: Number(document.getElementById("numeroAvance").value),
    tipo_documento: document.getElementById("tipoDocumento").value,
    fecha_entrega: document.getElementById("fechaEntrega").value,
    estado: document.getElementById("estadoAvance").value,
    comentario_tutor: document.getElementById("comentarioTutor").value.trim(),
    archivo: document.getElementById("archivoAvance").value.trim(),
    fecha_revision: document.getElementById("fechaRevision").value
  };

  if (id) {
    const index = db.avances.findIndex((item) => {
      return Number(item.id_avance) === Number(id);
    });

    db.avances[index] = avance;
    mostrarMensaje("Avance actualizado correctamente.");
  } else {
    db.avances.push(avance);
    mostrarMensaje("Avance registrado correctamente.");
  }

  guardarDatos();
  limpiarFormAvance();
  renderizarTodo();
}

function renderAvances() {
  const filas = db.avances.map((item, index) => {
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${nombreEstudiante(item.id_estudiante)}</td>
        <td>${item.numero_avance}</td>
        <td>${item.tipo_documento}</td>
        <td>${item.fecha_entrega}</td>
        <td>${badge(item.estado)}</td>
        <td>${item.comentario_tutor}</td>
        <td>
          <div class="actions">
            <button class="action-btn edit" onclick="editarAvance(${item.id_avance})">
              Editar
            </button>

            <button class="action-btn delete" onclick="eliminarRegistro('avances', 'id_avance', ${item.id_avance})">
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  document.getElementById("tablaAvances").innerHTML = filas;
}

function editarAvance(id) {
  const item = db.avances.find((avance) => {
    return Number(avance.id_avance) === Number(id);
  });

  document.getElementById("avanceId").value = item.id_avance;
  document.getElementById("avanceEstudiante").value = item.id_estudiante;
  document.getElementById("numeroAvance").value = item.numero_avance;
  document.getElementById("tipoDocumento").value = item.tipo_documento;
  document.getElementById("fechaEntrega").value = item.fecha_entrega;
  document.getElementById("estadoAvance").value = item.estado;
  document.getElementById("comentarioTutor").value = item.comentario_tutor;
  document.getElementById("archivoAvance").value = item.archivo;
  document.getElementById("fechaRevision").value = item.fecha_revision;

  mostrarSeccion("avances");
  mostrarMensaje("Modo edición de avance activado.");
}

function limpiarFormAvance() {
  document.getElementById("formAvance").reset();
  document.getElementById("avanceId").value = "";
  document.getElementById("numeroAvance").value = 1;
  document.getElementById("fechaEntrega").value = obtenerFechaActual();
}

/* =========================================================
   ELIMINAR REGISTROS
   ========================================================= */

function eliminarRegistro(coleccion, campoId, id) {
  const confirmar = confirm("¿Está seguro de eliminar este registro?");

  if (!confirmar) {
    return;
  }

  db[coleccion] = db[coleccion].filter((item) => {
    return Number(item[campoId]) !== Number(id);
  });

  guardarDatos();
  renderizarTodo();

  mostrarMensaje("Registro eliminado correctamente.");
}

/* =========================================================
   REPORTES
   ========================================================= */

function generarReporte(tipo) {
  const titulo = document.getElementById("tituloReporte");
  const thead = document.getElementById("theadReporte");
  const tbody = document.getElementById("tbodyReporte");

  let filas = [];
  ultimoReporte = [];

  if (tipo === "sinTema") {
    titulo.textContent = "Estudiantes sin tema";
    thead.innerHTML = `
      <tr>
        <th>#</th>
        <th>Estudiante</th>
        <th>Carrera</th>
        <th>Nivel</th>
      </tr>
    `;

    const datos = db.estudiantes.filter((item) => !getTemaByEstudiante(item.id_estudiante));

    filas = datos.map((item, index) => {
      ultimoReporte.push({
        estudiante: `${item.nombres} ${item.apellidos}`,
        carrera: item.carrera,
        nivel: item.nivel
      });

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${item.nombres} ${item.apellidos}</td>
          <td>${item.carrera}</td>
          <td>${item.nivel}</td>
        </tr>
      `;
    });
  }

  if (tipo === "sinTutor") {
    titulo.textContent = "Estudiantes sin tutor";
    thead.innerHTML = `
      <tr>
        <th>#</th>
        <th>Estudiante</th>
        <th>Tema</th>
        <th>Estado</th>
      </tr>
    `;

    const datos = db.estudiantes.filter((item) => {
      return getTemaByEstudiante(item.id_estudiante) &&
             !getAsignacionByEstudiante(item.id_estudiante);
    });

    filas = datos.map((item, index) => {
      const tema = getTemaByEstudiante(item.id_estudiante);

      ultimoReporte.push({
        estudiante: `${item.nombres} ${item.apellidos}`,
        tema: tema.titulo,
        estado: "Sin tutor"
      });

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${item.nombres} ${item.apellidos}</td>
          <td>${tema.titulo}</td>
          <td>${badge("Sin tutor")}</td>
        </tr>
      `;
    });
  }

  if (tipo === "avancesPendientes") {
    titulo.textContent = "Avances pendientes u observados";
    thead.innerHTML = `
      <tr>
        <th>#</th>
        <th>Estudiante</th>
        <th>Documento</th>
        <th>Estado</th>
        <th>Comentario</th>
      </tr>
    `;

    const datos = db.avances.filter((item) => {
      return item.estado === "Pendiente" || item.estado === "Observado";
    });

    filas = datos.map((item, index) => {
      ultimoReporte.push({
        estudiante: nombreEstudiante(item.id_estudiante),
        documento: item.tipo_documento,
        estado: item.estado,
        comentario: item.comentario_tutor
      });

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${nombreEstudiante(item.id_estudiante)}</td>
          <td>${item.tipo_documento}</td>
          <td>${badge(item.estado)}</td>
          <td>${item.comentario_tutor}</td>
        </tr>
      `;
    });
  }

  if (tipo === "inasistencias") {
    titulo.textContent = "Inasistencias a tutorías";
    thead.innerHTML = `
      <tr>
        <th>#</th>
        <th>Estudiante</th>
        <th>Fecha</th>
        <th>Tema tratado</th>
        <th>Asistencia</th>
      </tr>
    `;

    const datos = db.tutorias.filter((item) => item.asistencia === "No asistió");

    filas = datos.map((item, index) => {
      ultimoReporte.push({
        estudiante: nombreEstudiante(item.id_estudiante),
        fecha: item.fecha,
        tema: item.tema_tratado,
        asistencia: item.asistencia
      });

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${nombreEstudiante(item.id_estudiante)}</td>
          <td>${item.fecha}</td>
          <td>${item.tema_tratado}</td>
          <td>${badge(item.asistencia)}</td>
        </tr>
      `;
    });
  }

  tbody.innerHTML = filas.length
    ? filas.join("")
    : `<tr><td colspan="5">No existen registros para este reporte.</td></tr>`;

  mostrarSeccion("reportes");
}

function exportarReporte() {
  if (!ultimoReporte.length) {
    mostrarMensaje("Primero seleccione un reporte.");
    return;
  }

  const headers = Object.keys(ultimoReporte[0]);
  const filas = ultimoReporte.map((item) => {
    return headers.map((header) => escapeCSV(item[header])).join(",");
  });

  const csv = [headers.join(","), ...filas].join("\n");

  descargarArchivo("reporte_titulacion.csv", csv);
}

/* =========================================================
   CSV: PARSEAR, EXPORTAR E IMPORTAR
   ========================================================= */

function parseCSV(texto) {
  const lineas = texto.trim().split(/\r?\n/).filter(Boolean);
  const headers = dividirLineaCSV(lineas[0]);

  return lineas.slice(1).map((linea) => {
    const valores = dividirLineaCSV(linea);
    const objeto = {};

    headers.forEach((header, index) => {
      objeto[header] = valores[index] ?? "";
    });

    return objeto;
  });
}

function dividirLineaCSV(linea) {
  const resultado = [];
  let actual = "";
  let dentroComillas = false;

  for (let i = 0; i < linea.length; i++) {
    const caracter = linea[i];
    const siguiente = linea[i + 1];

    if (caracter === '"' && dentroComillas && siguiente === '"') {
      actual += '"';
      i++;
    } else if (caracter === '"') {
      dentroComillas = !dentroComillas;
    } else if (caracter === "," && !dentroComillas) {
      resultado.push(actual);
      actual = "";
    } else {
      actual += caracter;
    }
  }

  resultado.push(actual);

  return resultado;
}

function exportarCSV(coleccion) {
  const datos = db[coleccion];

  if (!datos.length) {
    mostrarMensaje("No existen datos para exportar.");
    return;
  }

  const headers = Object.keys(datos[0]);

  const filas = datos.map((item) => {
    return headers.map((header) => escapeCSV(item[header])).join(",");
  });

  const csv = [headers.join(","), ...filas].join("\n");

  descargarArchivo(`${coleccion}.csv`, csv);
}

function importarCSV() {
  const tipo = document.getElementById("tipoImportacion").value;
  const archivo = document.getElementById("archivoCSV").files[0];

  if (!archivo) {
    mostrarMensaje("Seleccione un archivo CSV.");
    return;
  }

  const reader = new FileReader();

  reader.onload = (event) => {
    const texto = event.target.result;

    db[tipo] = parseCSV(texto);

    guardarDatos();
    renderizarTodo();

    mostrarMensaje(`Archivo ${tipo}.csv importado correctamente.`);
  };

  reader.readAsText(archivo);
}

function escapeCSV(valor) {
  const texto = String(valor ?? "").replaceAll('"', '""');

  if (/[",\n]/.test(texto)) {
    return `"${texto}"`;
  }

  return texto;
}

function descargarArchivo(nombre, contenido) {
  const blob = new Blob([contenido], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");

  enlace.href = url;
  enlace.download = nombre;
  enlace.click();

  URL.revokeObjectURL(url);
}

/* =========================================================
   MENSAJES
   ========================================================= */

function mostrarMensaje(mensaje) {
  const toast = document.getElementById("toast");

  toast.textContent = mensaje;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 2800);
}

/* =========================================================
   MODO OSCURO
   ========================================================= */

function alternarModoOscuro() {
  const body = document.body;
  const boton = document.getElementById("darkModeBtn");

  body.classList.toggle("dark-mode");

  const modoOscuroActivo = body.classList.contains("dark-mode");

  if (modoOscuroActivo) {
    boton.textContent = "⚪ Modo claro";
    localStorage.setItem("modoOscuro", "activo");
  } else {
    boton.textContent = "⚫ Modo oscuro";
    localStorage.setItem("modoOscuro", "inactivo");
  }
}

function cargarPreferenciaModoOscuro() {
  const modoGuardado = localStorage.getItem("modoOscuro");
  const boton = document.getElementById("darkModeBtn");

  if (modoGuardado === "activo") {
    document.body.classList.add("dark-mode");

    if (boton) {
      boton.textContent = "⚪ Modo claro";
    }
  } else {
    document.body.classList.remove("dark-mode");

    if (boton) {
      boton.textContent = "⚫ Modo oscuro";
    }
  }
}