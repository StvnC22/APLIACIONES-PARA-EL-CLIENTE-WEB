<template>
  <section class="page">
    <div class="page-title">
      <div>
        <h2>Temas de Titulación</h2>
        <p>Registro y control de temas seleccionados por los estudiantes.</p>
      </div>
    </div>

    <div class="layout-two">
      <!-- FORMULARIO -->
      <form class="card" @submit.prevent="guardarTema">
        <h3>{{ editando ? "Editar tema" : "Nuevo tema" }}</h3>

        <input type="hidden" v-model="form.id_tema" />

        <div class="form-grid">
          <div class="field">
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

          <div class="field">
            <label>Línea de investigación *</label>
            <select v-model="form.linea_investigacion" required>
              <option value="">Seleccione</option>
              <option>Salud pública y bienestar</option>
              <option>Gestión empresarial y comercio</option>
              <option>Educación, turismo y humanidades</option>
              <option>Ingeniería, industria y construcción</option>
              <option>Ciencias de la vida y tecnologías</option>
              <option>Derecho, sociedad y bienestar</option>
              <option>Innovación tecnológica</option>
              <option>Desarrollo sostenible</option>
              <option>Gestión académica y documental</option>
            </select>
          </div>

          <div class="field full-field">
            <label>Título del tema *</label>
            <input
              v-model="form.titulo"
              type="text"
              placeholder="Ingrese el título del tema"
              required
            />
          </div>

          <div class="field">
            <label>Fecha de propuesta *</label>
            <input
              v-model="form.fecha_propuesta"
              type="date"
              required
            />
          </div>

          <div class="field">
            <label>Estado *</label>
            <select v-model="form.estado" required>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Observado">Observado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </div>

          <div class="field full-field">
            <label>Descripción *</label>
            <textarea
              v-model="form.descripcion"
              placeholder="Describa brevemente el tema"
              required
            ></textarea>
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
          <h3>Listado de temas</h3>

          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar tema..."
          />
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Carrera</th>
                <th>Nivel</th>
                <th>Tema</th>
                <th>Línea</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="tema in temasFiltrados"
                :key="tema.id_tema"
              >
                <td>{{ obtenerNombreEstudiante(tema.id_estudiante) }}</td>
                <td>{{ obtenerCarreraEstudiante(tema.id_estudiante) }}</td>
                <td>{{ obtenerNivelEstudiante(tema.id_estudiante) }}</td>
                <td>{{ tema.titulo }}</td>
                <td>{{ tema.linea_investigacion }}</td>
                <td>
                  <span class="badge">
                    {{ tema.estado }}
                  </span>
                </td>
                <td>
                  <button
                    class="action-btn edit"
                    type="button"
                    @click="editarTema(tema)"
                  >
                    Editar
                  </button>

                  <button
                    class="action-btn delete"
                    type="button"
                    @click="eliminarTema(tema.id_tema)"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>

              <tr v-if="temasFiltrados.length === 0">
                <td colspan="7">
                  No se encontraron temas registrados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="summary-text">
          Total de temas: {{ temas.length }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { cargarCSV } from "../services/csvService";

const estudiantes = ref([]);
const temas = ref([]);
const busqueda = ref("");
const editando = ref(false);

const form = ref({
  id_tema: "",
  id_estudiante: "",
  titulo: "",
  linea_investigacion: "",
  descripcion: "",
  fecha_propuesta: new Date().toISOString().slice(0, 10),
  estado: "Pendiente",
  observaciones: ""
});

const temasFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase();

  return temas.value.filter((item) => {
    const estudiante = obtenerNombreEstudiante(item.id_estudiante);
    const carrera = obtenerCarreraEstudiante(item.id_estudiante);
    const nivel = obtenerNivelEstudiante(item.id_estudiante);

    return (
      estudiante.toLowerCase().includes(texto) ||
      carrera.toLowerCase().includes(texto) ||
      nivel.toLowerCase().includes(texto) ||
      item.titulo?.toLowerCase().includes(texto) ||
      item.linea_investigacion?.toLowerCase().includes(texto) ||
      item.estado?.toLowerCase().includes(texto)
    );
  });
});

onMounted(() => {
  cargarEstudiantes();
  cargarTemas();
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

async function cargarTemas() {
  const datosGuardados = localStorage.getItem("temas_vue");

  if (datosGuardados) {
    temas.value = JSON.parse(datosGuardados);
    return;
  }

  temas.value = await cargarCSV("/data/temas.csv");

  guardarEnLocalStorage();
}

function guardarEnLocalStorage() {
  localStorage.setItem(
    "temas_vue",
    JSON.stringify(temas.value)
  );
}

function guardarTema() {
  if (!validarFormulario()) {
    return;
  }

  if (editando.value) {
    actualizarTema();
  } else {
    agregarTema();
  }

  guardarEnLocalStorage();
  limpiarFormulario();
}

function agregarTema() {
  const nuevoId = obtenerNuevoId();

  temas.value.push({
    ...form.value,
    id_tema: nuevoId
  });
}

function actualizarTema() {
  const index = temas.value.findIndex((item) => {
    return Number(item.id_tema) === Number(form.value.id_tema);
  });

  if (index !== -1) {
    temas.value[index] = { ...form.value };
  }
}

function editarTema(tema) {
  form.value = { ...tema };
  editando.value = true;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function eliminarTema(id) {
  const confirmar = confirm("¿Seguro que deseas eliminar este tema?");

  if (!confirmar) {
    return;
  }

  temas.value = temas.value.filter((item) => {
    return Number(item.id_tema) !== Number(id);
  });

  guardarEnLocalStorage();
}

function limpiarFormulario() {
  form.value = {
    id_tema: "",
    id_estudiante: "",
    titulo: "",
    linea_investigacion: "",
    descripcion: "",
    fecha_propuesta: new Date().toISOString().slice(0, 10),
    estado: "Pendiente",
    observaciones: ""
  };

  editando.value = false;
}

function obtenerNuevoId() {
  if (temas.value.length === 0) {
    return 1;
  }

  const ids = temas.value.map((item) => {
    return Number(item.id_tema);
  });

  return Math.max(...ids) + 1;
}

function validarFormulario() {
  const temaDuplicado = temas.value.some((item) => {
    return (
      Number(item.id_estudiante) === Number(form.value.id_estudiante) &&
      Number(item.id_tema) !== Number(form.value.id_tema)
    );
  });

  if (temaDuplicado) {
    alert("Este estudiante ya tiene un tema registrado.");
    return false;
  }

  return true;
}

function obtenerEstudiante(id) {
  return estudiantes.value.find((item) => {
    return Number(item.id_estudiante) === Number(id);
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
</script>