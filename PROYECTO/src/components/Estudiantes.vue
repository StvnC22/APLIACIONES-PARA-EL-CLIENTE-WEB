<template>
  <section class="page">
    <div class="page-title">
      <div>
        <h2>Registro de Estudiantes</h2>
        <p>Gestión de estudiantes en proceso de titulación.</p>
      </div>
    </div>

    <div class="layout-two">
      <!-- FORMULARIO -->
      <form class="card" @submit.prevent="guardarEstudiante">
        <h3>{{ editando ? "Editar estudiante" : "Nuevo estudiante" }}</h3>

        <input type="hidden" v-model="form.id_estudiante" />

        <div class="form-grid">
          <div class="field">
            <label>Cédula *</label>
            <input
              v-model="form.cedula"
              type="text"
              maxlength="10"
              placeholder="Ingrese cédula"
              required
            />
          </div>

          <div class="field">
            <label>Nombres *</label>
            <input
              v-model="form.nombres"
              type="text"
              placeholder="Ingrese nombres"
              required
            />
          </div>

          <div class="field">
            <label>Apellidos *</label>
            <input
              v-model="form.apellidos"
              type="text"
              placeholder="Ingrese apellidos"
              required
            />
          </div>

          <div class="field">
            <label>Carrera *</label>
            <select v-model="form.carrera" required @change="form.nivel = ''">
              <option value="">Seleccione</option>

              <option
                v-for="carrera in carreras"
                :key="carrera"
                :value="carrera"
              >
                {{ carrera }}
              </option>
            </select>
          </div>

          <div class="field">
            <label>Nivel *</label>
            <select v-model="form.nivel" required>
              <option value="">
                {{ form.carrera ? "Seleccione nivel" : "Primero seleccione carrera" }}
              </option>

              <option
                v-for="nivel in nivelesDisponibles"
                :key="nivel"
                :value="nivel"
              >
                {{ nivel }}
              </option>
            </select>
          </div>

          <div class="field">
            <label>Correo *</label>
            <input
              v-model="form.correo"
              type="email"
              placeholder="correo@live.uleam.edu.ec"
              required
            />
          </div>

          <div class="field">
            <label>Teléfono *</label>
            <input
              v-model="form.telefono"
              type="text"
              maxlength="10"
              placeholder="Ingrese teléfono"
              required
            />
          </div>

          <div class="field">
            <label>Estado *</label>
            <select v-model="form.estado" required>
              <option value="Activo">Activo</option>
              <option value="En proceso de titulación">En proceso de titulación</option>
              <option value="Egresado">Egresado</option>
            </select>
          </div>

          <div class="field">
            <label>Fecha de registro *</label>
            <input
              v-model="form.fecha_registro"
              type="date"
              required
            />
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
          <h3>Listado de estudiantes</h3>

          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar estudiante..."
          />
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cédula</th>
                <th>Estudiante</th>
                <th>Carrera</th>
                <th>Nivel</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="estudiante in estudiantesFiltrados"
                :key="estudiante.id_estudiante"
              >
                <td>{{ estudiante.cedula }}</td>
                <td>{{ estudiante.nombres }} {{ estudiante.apellidos }}</td>
                <td>{{ estudiante.carrera }}</td>
                <td>{{ estudiante.nivel }}</td>
                <td>{{ estudiante.correo }}</td>
                <td>
                  <span class="badge">
                    {{ estudiante.estado }}
                  </span>
                </td>
                <td>
                  <button
                    class="action-btn edit"
                    @click="editarEstudiante(estudiante)"
                  >
                    Editar
                  </button>

                  <button
                    class="action-btn delete"
                    @click="eliminarEstudiante(estudiante.id_estudiante)"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>

              <tr v-if="estudiantesFiltrados.length === 0">
                <td colspan="7">
                  No se encontraron estudiantes.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="summary-text">
          Total de estudiantes: {{ estudiantes.length }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import {
  carreras,
  obtenerNivelesPorCarrera
} from "../data/carreras";
import {
  cargarCSV
} from "../services/csvService";

const estudiantes = ref([]);
const busqueda = ref("");
const editando = ref(false);

const form = ref({
  id_estudiante: "",
  cedula: "",
  nombres: "",
  apellidos: "",
  carrera: "",
  nivel: "",
  correo: "",
  telefono: "",
  estado: "Activo",
  fecha_registro: new Date().toISOString().slice(0, 10)
});

const nivelesDisponibles = computed(() => {
  return obtenerNivelesPorCarrera(form.value.carrera);
});

const estudiantesFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase();

  return estudiantes.value.filter((item) => {
    return (
      item.cedula?.toLowerCase().includes(texto) ||
      item.nombres?.toLowerCase().includes(texto) ||
      item.apellidos?.toLowerCase().includes(texto) ||
      item.carrera?.toLowerCase().includes(texto) ||
      item.nivel?.toLowerCase().includes(texto) ||
      item.correo?.toLowerCase().includes(texto)
    );
  });
});

onMounted(() => {
  cargarEstudiantes();
});

async function cargarEstudiantes() {
  const datosGuardados = localStorage.getItem("estudiantes_vue");

  if (datosGuardados) {
    estudiantes.value = JSON.parse(datosGuardados);
    return;
  }

  estudiantes.value = await cargarCSV("/data/estudiantes.csv");
  guardarEnLocalStorage();
}

function guardarEnLocalStorage() {
  localStorage.setItem(
    "estudiantes_vue",
    JSON.stringify(estudiantes.value)
  );
}

function guardarEstudiante() {
  if (!validarFormulario()) {
    return;
  }

  if (editando.value) {
    actualizarEstudiante();
  } else {
    agregarEstudiante();
  }

  guardarEnLocalStorage();
  limpiarFormulario();
}

function agregarEstudiante() {
  const nuevoId = obtenerNuevoId();

  estudiantes.value.push({
    ...form.value,
    id_estudiante: nuevoId
  });
}

function actualizarEstudiante() {
  const index = estudiantes.value.findIndex((item) => {
    return Number(item.id_estudiante) === Number(form.value.id_estudiante);
  });

  if (index !== -1) {
    estudiantes.value[index] = { ...form.value };
  }
}

function editarEstudiante(estudiante) {
  form.value = { ...estudiante };
  editando.value = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function eliminarEstudiante(id) {
  const confirmar = confirm("¿Seguro que deseas eliminar este estudiante?");

  if (!confirmar) {
    return;
  }

  estudiantes.value = estudiantes.value.filter((item) => {
    return Number(item.id_estudiante) !== Number(id);
  });

  guardarEnLocalStorage();
}

function limpiarFormulario() {
  form.value = {
    id_estudiante: "",
    cedula: "",
    nombres: "",
    apellidos: "",
    carrera: "",
    nivel: "",
    correo: "",
    telefono: "",
    estado: "Activo",
    fecha_registro: new Date().toISOString().slice(0, 10)
  };

  editando.value = false;
}

function obtenerNuevoId() {
  if (estudiantes.value.length === 0) {
    return 1;
  }

  const ids = estudiantes.value.map((item) => {
    return Number(item.id_estudiante);
  });

  return Math.max(...ids) + 1;
}

function validarFormulario() {
  const nivelesValidos = obtenerNivelesPorCarrera(form.value.carrera);

  if (!nivelesValidos.includes(form.value.nivel)) {
    alert("El nivel seleccionado no corresponde a la duración de la carrera.");
    return false;
  }

  const cedulaDuplicada = estudiantes.value.some((item) => {
    return (
      item.cedula === form.value.cedula &&
      Number(item.id_estudiante) !== Number(form.value.id_estudiante)
    );
  });

  if (cedulaDuplicada) {
    alert("Ya existe un estudiante con esa cédula.");
    return false;
  }

  const correoValido = /^[a-zA-Z0-9._%+-]+@live\.uleam\.edu\.ec$/;

  if (!correoValido.test(form.value.correo)) {
    alert("El correo debe tener el formato usuario@live.uleam.edu.ec");
    return false;
  }

  return true;
}
</script>