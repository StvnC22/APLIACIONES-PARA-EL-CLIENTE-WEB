<template>
  <section class="page">
    <div class="page-title">
      <div>
        <h2>Avances y Borradores</h2>
        <p>Control de entregas, revisiones y observaciones del trabajo de titulación.</p>
      </div>
    </div>

    <div class="layout-two">
      <!-- FORMULARIO -->
      <form class="card" @submit.prevent="guardarAvance">
        <h3>{{ editando ? "Editar avance" : "Nuevo avance" }}</h3>

        <input type="hidden" v-model="form.id_avance" />

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

          <div class="field">
            <label>Número de avance *</label>

            <select v-model="form.numero_avance" required>
              <option value="">Seleccione</option>
              <option value="1">Avance 1</option>
              <option value="2">Avance 2</option>
              <option value="3">Avance 3</option>
              <option value="4">Avance 4</option>
              <option value="5">Avance 5</option>
              <option value="6">Avance 6</option>
            </select>
          </div>

          <div class="field">
            <label>Tipo de documento *</label>

            <select v-model="form.tipo_documento" required>
              <option value="">Seleccione</option>
              <option value="Propuesta de tema">Propuesta de tema</option>
              <option value="Capítulo I">Capítulo I</option>
              <option value="Capítulo II">Capítulo II</option>
              <option value="Capítulo III">Capítulo III</option>
              <option value="Borrador parcial">Borrador parcial</option>
              <option value="Borrador final">Borrador final</option>
              <option value="Trabajo final">Trabajo final</option>
            </select>
          </div>

          <div class="field">
            <label>Fecha de entrega *</label>

            <input
              v-model="form.fecha_entrega"
              type="date"
              required
            />
          </div>

          <div class="field">
            <label>Estado *</label>

            <select v-model="form.estado" required>
              <option value="Pendiente">Pendiente</option>
              <option value="Entregado">Entregado</option>
              <option value="Observado">Observado</option>
              <option value="Corregido">Corregido</option>
              <option value="Aprobado">Aprobado</option>
            </select>
          </div>

          <div class="field">
            <label>Archivo</label>

            <input
              v-model="form.archivo"
              type="text"
              placeholder="Ejemplo: avance_1.pdf"
            />
          </div>

          <div class="field">
            <label>Fecha de revisión</label>

            <input
              v-model="form.fecha_revision"
              type="date"
            />
          </div>

          <div class="field full-field">
            <label>Comentario del tutor *</label>

            <textarea
              v-model="form.comentario_tutor"
              placeholder="Ingrese el comentario o revisión del tutor"
              required
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
          <h3>Listado de avances</h3>

          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar avance..."
          />
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Carrera</th>
                <th>Nivel</th>
                <th>Avance</th>
                <th>Documento</th>
                <th>Entrega</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="avance in avancesFiltrados"
                :key="avance.id_avance"
              >
                <td>{{ obtenerNombreEstudiante(avance.id_estudiante) }}</td>
                <td>{{ obtenerCarreraEstudiante(avance.id_estudiante) }}</td>
                <td>{{ obtenerNivelEstudiante(avance.id_estudiante) }}</td>
                <td>Avance {{ avance.numero_avance }}</td>
                <td>{{ avance.tipo_documento }}</td>
                <td>{{ avance.fecha_entrega }}</td>
                <td>
                  <span class="badge">
                    {{ avance.estado }}
                  </span>
                </td>
                <td>
                  <button
                    class="action-btn edit"
                    type="button"
                    @click="editarAvance(avance)"
                  >
                    Editar
                  </button>

                  <button
                    class="action-btn delete"
                    type="button"
                    @click="eliminarAvance(avance.id_avance)"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>

              <tr v-if="avancesFiltrados.length === 0">
                <td colspan="8">
                  No se encontraron avances registrados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="summary-text">
          Total de avances: {{ avances.length }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { cargarCSV } from "../services/csvService";

const estudiantes = ref([]);
const avances = ref([]);

const busqueda = ref("");
const editando = ref(false);

const form = ref({
  id_avance: "",
  id_estudiante: "",
  numero_avance: "",
  tipo_documento: "",
  fecha_entrega: new Date().toISOString().slice(0, 10),
  estado: "Pendiente",
  comentario_tutor: "",
  archivo: "",
  fecha_revision: ""
});

const avancesFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase();

  return avances.value.filter((item) => {
    const estudiante = obtenerNombreEstudiante(item.id_estudiante);
    const carrera = obtenerCarreraEstudiante(item.id_estudiante);
    const nivel = obtenerNivelEstudiante(item.id_estudiante);

    return (
      estudiante.toLowerCase().includes(texto) ||
      carrera.toLowerCase().includes(texto) ||
      nivel.toLowerCase().includes(texto) ||
      String(item.numero_avance).toLowerCase().includes(texto) ||
      item.tipo_documento?.toLowerCase().includes(texto) ||
      item.fecha_entrega?.toLowerCase().includes(texto) ||
      item.estado?.toLowerCase().includes(texto) ||
      item.comentario_tutor?.toLowerCase().includes(texto)
    );
  });
});

onMounted(() => {
  cargarEstudiantes();
  cargarAvances();
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

async function cargarAvances() {
  const datosGuardados = localStorage.getItem("avances_vue");

  if (datosGuardados) {
    avances.value = JSON.parse(datosGuardados);
    return;
  }

  avances.value = await cargarCSV("/data/avances.csv");

  guardarEnLocalStorage();
}

function guardarEnLocalStorage() {
  localStorage.setItem(
    "avances_vue",
    JSON.stringify(avances.value)
  );
}

function guardarAvance() {
  if (!validarFormulario()) {
    return;
  }

  if (editando.value) {
    actualizarAvance();
  } else {
    agregarAvance();
  }

  guardarEnLocalStorage();
  limpiarFormulario();
}

function agregarAvance() {
  const nuevoId = obtenerNuevoId();

  avances.value.push({
    ...form.value,
    id_avance: nuevoId
  });
}

function actualizarAvance() {
  const index = avances.value.findIndex((item) => {
    return Number(item.id_avance) === Number(form.value.id_avance);
  });

  if (index !== -1) {
    avances.value[index] = { ...form.value };
  }
}

function editarAvance(avance) {
  form.value = { ...avance };
  editando.value = true;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function eliminarAvance(id) {
  const confirmar = confirm("¿Seguro que deseas eliminar este avance?");

  if (!confirmar) {
    return;
  }

  avances.value = avances.value.filter((item) => {
    return Number(item.id_avance) !== Number(id);
  });

  guardarEnLocalStorage();
}

function limpiarFormulario() {
  form.value = {
    id_avance: "",
    id_estudiante: "",
    numero_avance: "",
    tipo_documento: "",
    fecha_entrega: new Date().toISOString().slice(0, 10),
    estado: "Pendiente",
    comentario_tutor: "",
    archivo: "",
    fecha_revision: ""
  };

  editando.value = false;
}

function obtenerNuevoId() {
  if (avances.value.length === 0) {
    return 1;
  }

  const ids = avances.value.map((item) => {
    return Number(item.id_avance);
  });

  return Math.max(...ids) + 1;
}

function validarFormulario() {
  if (!form.value.id_estudiante) {
    alert("Debe seleccionar un estudiante.");
    return false;
  }

  if (!form.value.numero_avance) {
    alert("Debe seleccionar el número de avance.");
    return false;
  }

  if (!form.value.tipo_documento) {
    alert("Debe seleccionar el tipo de documento.");
    return false;
  }

  const avanceDuplicado = avances.value.some((item) => {
    return (
      Number(item.id_estudiante) === Number(form.value.id_estudiante) &&
      Number(item.numero_avance) === Number(form.value.numero_avance) &&
      Number(item.id_avance) !== Number(form.value.id_avance)
    );
  });

  if (avanceDuplicado) {
    alert("Este estudiante ya tiene registrado ese número de avance.");
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