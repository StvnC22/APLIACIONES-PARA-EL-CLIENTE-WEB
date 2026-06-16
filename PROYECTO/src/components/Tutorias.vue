<template>
  <section class="page">
    <div class="page-title">
      <div>
        <h2>Control de Tutorías</h2>
        <p>Registro de sesiones de tutoría, asistencia, actividades y compromisos.</p>
      </div>
    </div>

    <div class="layout-two">
      <!-- FORMULARIO -->
      <form class="card" @submit.prevent="guardarTutoria">
        <h3>{{ editando ? "Editar tutoría" : "Nueva tutoría" }}</h3>

        <input type="hidden" v-model="form.id_tutoria" />

        <div class="form-grid">
          <div class="field full-field">
            <label>Estudiante *</label>

            <select v-model="form.id_estudiante" required>
              <option value="">Seleccione estudiante</option>

              <option
                v-for="estudiante in estudiantes"
                :key="estudiante.id_estudiante"
                :value="estudiante.id_estudiante"
              >
                {{ estudiante.nombres }} {{ estudiante.apellidos }} -
                {{ estudiante.carrera }} -
                {{ estudiante.nivel }}
              </option>
            </select>
          </div>

          <div class="field full-field">
            <label>Docente Tutor *</label>

            <select v-model="form.id_docente" required>
              <option value="">Seleccione docente tutor</option>

              <option
                v-for="docente in docentesActivos"
                :key="docente.id_docente"
                :value="docente.id_docente"
              >
                {{ docente.nombres }} - {{ docente.especialidad }}
              </option>
            </select>
          </div>

          <div class="field">
            <label>Fecha *</label>

            <input
              v-model="form.fecha"
              type="date"
              required
            />
          </div>

          <div class="field">
            <label>Hora *</label>

            <input
              v-model="form.hora"
              type="time"
              required
            />
          </div>

          <div class="field">
            <label>Modalidad *</label>

            <select v-model="form.modalidad" required>
              <option value="Presencial">Presencial</option>
              <option value="Virtual">Virtual</option>
            </select>
          </div>

          <div class="field">
            <label>Asistencia *</label>

            <select v-model="form.asistencia" required>
              <option value="Asistió">Asistió</option>
              <option value="No asistió">No asistió</option>
              <option value="Justificado">Justificado</option>
            </select>
          </div>

          <div class="field full-field">
            <label>Tema tratado *</label>

            <input
              v-model="form.tema_tratado"
              type="text"
              placeholder="Ejemplo: Revisión del planteamiento del problema"
              required
            />
          </div>

          <div class="field full-field">
            <label>Actividades realizadas *</label>

            <textarea
              v-model="form.actividades"
              placeholder="Detalle las actividades revisadas en la tutoría"
              required
            ></textarea>
          </div>

          <div class="field full-field">
            <label>Compromisos *</label>

            <textarea
              v-model="form.compromisos"
              placeholder="Detalle los compromisos para la siguiente tutoría"
              required
            ></textarea>
          </div>

          <div class="field">
            <label>Próxima tutoría</label>

            <input
              v-model="form.proxima_tutoria"
              type="date"
            />
          </div>

          <div class="field full-field">
            <label>Observaciones</label>

            <textarea
              v-model="form.observaciones"
              placeholder="Ingrese observaciones si existen"
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn primary" type="submit">
            {{ editando ? "Actualizar" : "Guardar" }}
          </button>

          <button
            class="btn neutral"
            type="button"
            @click="limpiarFormulario"
          >
            Limpiar
          </button>
        </div>
      </form>

      <!-- TABLA -->
      <div class="card">
        <div class="table-header">
          <h3>Listado de tutorías</h3>

          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar tutoría..."
          />
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Carrera</th>
                <th>Nivel</th>
                <th>Docente</th>
                <th>Fecha</th>
                <th>Modalidad</th>
                <th>Asistencia</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="tutoria in tutoriasFiltradas"
                :key="tutoria.id_tutoria"
              >
                <td>{{ obtenerNombreEstudiante(tutoria.id_estudiante) }}</td>
                <td>{{ obtenerCarreraEstudiante(tutoria.id_estudiante) }}</td>
                <td>{{ obtenerNivelEstudiante(tutoria.id_estudiante) }}</td>
                <td>{{ obtenerNombreDocente(tutoria.id_docente) }}</td>
                <td>{{ tutoria.fecha }}</td>
                <td>{{ tutoria.modalidad }}</td>
                <td>
                  <span class="badge">
                    {{ tutoria.asistencia }}
                  </span>
                </td>
                <td>
                  <button
                    class="action-btn edit"
                    type="button"
                    @click="editarTutoria(tutoria)"
                  >
                    Editar
                  </button>

                  <button
                    class="action-btn delete"
                    type="button"
                    @click="eliminarTutoria(tutoria.id_tutoria)"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>

              <tr v-if="tutoriasFiltradas.length === 0">
                <td colspan="8">
                  No se encontraron tutorías registradas.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="summary-text">
          Total de tutorías: {{ tutorias.length }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { cargarCSV } from "../services/csvService";

const estudiantes = ref([]);
const docentes = ref([]);
const tutorias = ref([]);

const busqueda = ref("");
const editando = ref(false);

const form = ref({
  id_tutoria: "",
  id_estudiante: "",
  id_docente: "",
  fecha: new Date().toISOString().slice(0, 10),
  hora: "09:00",
  modalidad: "Presencial",
  tema_tratado: "",
  actividades: "",
  compromisos: "",
  proxima_tutoria: "",
  asistencia: "Asistió",
  observaciones: ""
});

const docentesActivos = computed(() => {
  return docentes.value.filter((docente) => {
    return docente.estado === "Activo";
  });
});

const tutoriasFiltradas = computed(() => {
  const texto = busqueda.value.toLowerCase();

  return tutorias.value.filter((item) => {
    const estudiante = obtenerNombreEstudiante(item.id_estudiante);
    const carrera = obtenerCarreraEstudiante(item.id_estudiante);
    const nivel = obtenerNivelEstudiante(item.id_estudiante);
    const docente = obtenerNombreDocente(item.id_docente);

    return (
      estudiante.toLowerCase().includes(texto) ||
      carrera.toLowerCase().includes(texto) ||
      nivel.toLowerCase().includes(texto) ||
      docente.toLowerCase().includes(texto) ||
      item.fecha?.toLowerCase().includes(texto) ||
      item.modalidad?.toLowerCase().includes(texto) ||
      item.asistencia?.toLowerCase().includes(texto) ||
      item.tema_tratado?.toLowerCase().includes(texto)
    );
  });
});

onMounted(() => {
  cargarEstudiantes();
  cargarDocentes();
  cargarTutorias();
});

async function cargarEstudiantes() {
  const datosGuardados = localStorage.getItem("estudiantes_vue");

  if (datosGuardados) {
    estudiantes.value = JSON.parse(datosGuardados);
    return;
  }

  estudiantes.value = await cargarCSV("/data/estudiantes.csv");

  localStorage.setItem(
    "estudiantes_vue",
    JSON.stringify(estudiantes.value)
  );
}

async function cargarDocentes() {
  const datosGuardados = localStorage.getItem("docentes_vue");

  if (datosGuardados) {
    docentes.value = JSON.parse(datosGuardados);
    return;
  }

  docentes.value = await cargarCSV("/data/docentes.csv");

  localStorage.setItem(
    "docentes_vue",
    JSON.stringify(docentes.value)
  );
}

async function cargarTutorias() {
  const datosGuardados = localStorage.getItem("tutorias_vue");

  if (datosGuardados) {
    tutorias.value = JSON.parse(datosGuardados);
    return;
  }

  tutorias.value = await cargarCSV("/data/tutorias.csv");

  guardarEnLocalStorage();
}

function guardarEnLocalStorage() {
  localStorage.setItem(
    "tutorias_vue",
    JSON.stringify(tutorias.value)
  );
}

function guardarTutoria() {
  if (!validarFormulario()) {
    return;
  }

  if (editando.value) {
    actualizarTutoria();
  } else {
    agregarTutoria();
  }

  guardarEnLocalStorage();
  limpiarFormulario();
}

function agregarTutoria() {
  const nuevoId = obtenerNuevoId();

  tutorias.value.push({
    ...form.value,
    id_tutoria: nuevoId
  });
}

function actualizarTutoria() {
  const index = tutorias.value.findIndex((item) => {
    return Number(item.id_tutoria) === Number(form.value.id_tutoria);
  });

  if (index !== -1) {
    tutorias.value[index] = { ...form.value };
  }
}

function editarTutoria(tutoria) {
  form.value = { ...tutoria };
  editando.value = true;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function eliminarTutoria(id) {
  const confirmar = confirm("¿Seguro que deseas eliminar esta tutoría?");

  if (!confirmar) {
    return;
  }

  tutorias.value = tutorias.value.filter((item) => {
    return Number(item.id_tutoria) !== Number(id);
  });

  guardarEnLocalStorage();
}

function limpiarFormulario() {
  form.value = {
    id_tutoria: "",
    id_estudiante: "",
    id_docente: "",
    fecha: new Date().toISOString().slice(0, 10),
    hora: "09:00",
    modalidad: "Presencial",
    tema_tratado: "",
    actividades: "",
    compromisos: "",
    proxima_tutoria: "",
    asistencia: "Asistió",
    observaciones: ""
  };

  editando.value = false;
}

function obtenerNuevoId() {
  if (tutorias.value.length === 0) {
    return 1;
  }

  const ids = tutorias.value.map((item) => {
    return Number(item.id_tutoria);
  });

  return Math.max(...ids) + 1;
}

function validarFormulario() {
  if (!form.value.id_estudiante) {
    alert("Debe seleccionar un estudiante.");
    return false;
  }

  if (!form.value.id_docente) {
    alert("Debe seleccionar un docente tutor.");
    return false;
  }

  return true;
}

function obtenerEstudiante(id) {
  return estudiantes.value.find((item) => {
    return Number(item.id_estudiante) === Number(id);
  });
}

function obtenerDocente(id) {
  return docentes.value.find((item) => {
    return Number(item.id_docente) === Number(id);
  });
}

function obtenerNombreEstudiante(id) {
  const estudiante = obtenerEstudiante(id);

  if (!estudiante) {
    return "Estudiante no encontrado";
  }

  return `${estudiante.nombres} ${estudiante.apellidos}`;
}

function obtenerCarreraEstudiante(id) {
  const estudiante = obtenerEstudiante(id);

  return estudiante ? estudiante.carrera : "Sin carrera";
}

function obtenerNivelEstudiante(id) {
  const estudiante = obtenerEstudiante(id);

  return estudiante ? estudiante.nivel : "Sin nivel";
}

function obtenerNombreDocente(id) {
  const docente = obtenerDocente(id);

  if (!docente) {
    return "Docente no encontrado";
  }

  return docente.nombres;
}
</script>