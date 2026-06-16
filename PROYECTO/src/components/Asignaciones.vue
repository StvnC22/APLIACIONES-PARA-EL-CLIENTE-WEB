<template>
  <section class="page">
    <div class="page-title">
      <div>
        <h2>Asignación de Tutor</h2>
        <p>Asignación de docentes tutores a estudiantes en proceso de titulación.</p>
      </div>
    </div>

    <div class="layout-two">
      <!-- FORMULARIO -->
      <form class="card" @submit.prevent="guardarAsignacion">
        <h3>{{ editando ? "Editar asignación" : "Nueva asignación" }}</h3>

        <input type="hidden" v-model="form.id_asignacion" />

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
            <label>Fecha de asignación *</label>

            <input
              v-model="form.fecha_asignacion"
              type="date"
              required
            />
          </div>

          <div class="field">
            <label>Estado *</label>

            <select v-model="form.estado" required>
              <option value="Asignado">Asignado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div class="field full-field">
            <label>Observaciones</label>

            <textarea
              v-model="form.observaciones"
              placeholder="Ingrese observaciones de la asignación"
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
          <h3>Listado de asignaciones</h3>

          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar asignación..."
          />
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Carrera</th>
                <th>Nivel</th>
                <th>Docente Tutor</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="asignacion in asignacionesFiltradas"
                :key="asignacion.id_asignacion"
              >
                <td>{{ obtenerNombreEstudiante(asignacion.id_estudiante) }}</td>
                <td>{{ obtenerCarreraEstudiante(asignacion.id_estudiante) }}</td>
                <td>{{ obtenerNivelEstudiante(asignacion.id_estudiante) }}</td>
                <td>{{ obtenerNombreDocente(asignacion.id_docente) }}</td>
                <td>{{ asignacion.fecha_asignacion }}</td>
                <td>
                  <span class="badge">
                    {{ asignacion.estado }}
                  </span>
                </td>
                <td>
                  <button
                    class="action-btn edit"
                    type="button"
                    @click="editarAsignacion(asignacion)"
                  >
                    Editar
                  </button>

                  <button
                    class="action-btn delete"
                    type="button"
                    @click="eliminarAsignacion(asignacion.id_asignacion)"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>

              <tr v-if="asignacionesFiltradas.length === 0">
                <td colspan="7">
                  No se encontraron asignaciones registradas.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="summary-text">
          Total de asignaciones: {{ asignaciones.length }}
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
const asignaciones = ref([]);

const busqueda = ref("");
const editando = ref(false);

const form = ref({
  id_asignacion: "",
  id_estudiante: "",
  id_docente: "",
  fecha_asignacion: new Date().toISOString().slice(0, 10),
  estado: "Asignado",
  observaciones: ""
});

const docentesActivos = computed(() => {
  return docentes.value.filter((docente) => {
    return docente.estado === "Activo";
  });
});

const asignacionesFiltradas = computed(() => {
  const texto = busqueda.value.toLowerCase();

  return asignaciones.value.filter((item) => {
    const estudiante = obtenerNombreEstudiante(item.id_estudiante);
    const carrera = obtenerCarreraEstudiante(item.id_estudiante);
    const nivel = obtenerNivelEstudiante(item.id_estudiante);
    const docente = obtenerNombreDocente(item.id_docente);

    return (
      estudiante.toLowerCase().includes(texto) ||
      carrera.toLowerCase().includes(texto) ||
      nivel.toLowerCase().includes(texto) ||
      docente.toLowerCase().includes(texto) ||
      item.fecha_asignacion?.toLowerCase().includes(texto) ||
      item.estado?.toLowerCase().includes(texto)
    );
  });
});

onMounted(() => {
  cargarEstudiantes();
  cargarDocentes();
  cargarAsignaciones();
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

async function cargarAsignaciones() {
  const datosGuardados = localStorage.getItem("asignaciones_vue");

  if (datosGuardados) {
    asignaciones.value = JSON.parse(datosGuardados);
    return;
  }

  asignaciones.value = await cargarCSV("/data/asignaciones.csv");

  guardarEnLocalStorage();
}

function guardarEnLocalStorage() {
  localStorage.setItem(
    "asignaciones_vue",
    JSON.stringify(asignaciones.value)
  );
}

function guardarAsignacion() {
  if (!validarFormulario()) {
    return;
  }

  if (editando.value) {
    actualizarAsignacion();
  } else {
    agregarAsignacion();
  }

  guardarEnLocalStorage();
  limpiarFormulario();
}

function agregarAsignacion() {
  const nuevoId = obtenerNuevoId();

  asignaciones.value.push({
    ...form.value,
    id_asignacion: nuevoId
  });
}

function actualizarAsignacion() {
  const index = asignaciones.value.findIndex((item) => {
    return Number(item.id_asignacion) === Number(form.value.id_asignacion);
  });

  if (index !== -1) {
    asignaciones.value[index] = { ...form.value };
  }
}

function editarAsignacion(asignacion) {
  form.value = { ...asignacion };
  editando.value = true;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function eliminarAsignacion(id) {
  const confirmar = confirm("¿Seguro que deseas eliminar esta asignación?");

  if (!confirmar) {
    return;
  }

  asignaciones.value = asignaciones.value.filter((item) => {
    return Number(item.id_asignacion) !== Number(id);
  });

  guardarEnLocalStorage();
}

function limpiarFormulario() {
  form.value = {
    id_asignacion: "",
    id_estudiante: "",
    id_docente: "",
    fecha_asignacion: new Date().toISOString().slice(0, 10),
    estado: "Asignado",
    observaciones: ""
  };

  editando.value = false;
}

function obtenerNuevoId() {
  if (asignaciones.value.length === 0) {
    return 1;
  }

  const ids = asignaciones.value.map((item) => {
    return Number(item.id_asignacion);
  });

  return Math.max(...ids) + 1;
}

function validarFormulario() {
  const estudianteYaAsignado = asignaciones.value.some((item) => {
    return (
      Number(item.id_estudiante) === Number(form.value.id_estudiante) &&
      Number(item.id_asignacion) !== Number(form.value.id_asignacion) &&
      item.estado === "Asignado"
    );
  });

  if (estudianteYaAsignado) {
    alert("Este estudiante ya tiene un tutor asignado.");
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