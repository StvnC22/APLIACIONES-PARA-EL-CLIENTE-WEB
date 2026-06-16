<template>
  <section class="page">
    <div class="page-title">
      <div>
        <h2>Registro de Docentes</h2>
        <p>Gestión de docentes tutores para trabajos de titulación.</p>
      </div>
    </div>

    <div class="layout-two">
      <!-- FORMULARIO -->
      <form class="card" @submit.prevent="guardarDocente">
        <h3>{{ editando ? "Editar docente" : "Nuevo docente" }}</h3>

        <input type="hidden" v-model="form.id_docente" />

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
              placeholder="Ingrese nombres del docente"
              required
            />
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
            <label>Especialidad *</label>
            <input
              v-model="form.especialidad"
              type="text"
              placeholder="Ingrese especialidad"
              required
            />
          </div>

          <div class="field">
            <label>Estado *</label>
            <select v-model="form.estado" required>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
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
          <h3>Listado de docentes</h3>

          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar docente..."
          />
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cédula</th>
                <th>Docente</th>
                <th>Correo</th>
                <th>Especialidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="docente in docentesFiltrados"
                :key="docente.id_docente"
              >
                <td>{{ docente.cedula }}</td>
                <td>{{ docente.nombres }}</td>
                <td>{{ docente.correo }}</td>
                <td>{{ docente.especialidad }}</td>
                <td>
                  <span class="badge">
                    {{ docente.estado }}
                  </span>
                </td>
                <td>
                  <button
                    class="action-btn edit"
                    type="button"
                    @click="editarDocente(docente)"
                  >
                    Editar
                  </button>

                  <button
                    class="action-btn delete"
                    type="button"
                    @click="eliminarDocente(docente.id_docente)"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>

              <tr v-if="docentesFiltrados.length === 0">
                <td colspan="6">
                  No se encontraron docentes.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="summary-text">
          Total de docentes: {{ docentes.length }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { cargarCSV } from "../services/csvService";

const docentes = ref([]);
const busqueda = ref("");
const editando = ref(false);

const form = ref({
  id_docente: "",
  cedula: "",
  nombres: "",
  correo: "",
  especialidad: "",
  estado: "Activo"
});

const docentesFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase();

  return docentes.value.filter((item) => {
    return (
      item.cedula?.toLowerCase().includes(texto) ||
      item.nombres?.toLowerCase().includes(texto) ||
      item.correo?.toLowerCase().includes(texto) ||
      item.especialidad?.toLowerCase().includes(texto) ||
      item.estado?.toLowerCase().includes(texto)
    );
  });
});

onMounted(() => {
  cargarDocentes();
});

async function cargarDocentes() {
  const datosGuardados = localStorage.getItem("docentes_vue");

  if (datosGuardados) {
    docentes.value = JSON.parse(datosGuardados);
    return;
  }

  docentes.value = await cargarCSV("/data/docentes.csv");
  guardarEnLocalStorage();
}

function guardarEnLocalStorage() {
  localStorage.setItem(
    "docentes_vue",
    JSON.stringify(docentes.value)
  );
}

function guardarDocente() {
  if (!validarFormulario()) {
    return;
  }

  if (editando.value) {
    actualizarDocente();
  } else {
    agregarDocente();
  }

  guardarEnLocalStorage();
  limpiarFormulario();
}

function agregarDocente() {
  const nuevoId = obtenerNuevoId();

  docentes.value.push({
    ...form.value,
    id_docente: nuevoId
  });
}

function actualizarDocente() {
  const index = docentes.value.findIndex((item) => {
    return Number(item.id_docente) === Number(form.value.id_docente);
  });

  if (index !== -1) {
    docentes.value[index] = { ...form.value };
  }
}

function editarDocente(docente) {
  form.value = { ...docente };
  editando.value = true;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function eliminarDocente(id) {
  const confirmar = confirm("¿Seguro que deseas eliminar este docente?");

  if (!confirmar) {
    return;
  }

  docentes.value = docentes.value.filter((item) => {
    return Number(item.id_docente) !== Number(id);
  });

  guardarEnLocalStorage();
}

function limpiarFormulario() {
  form.value = {
    id_docente: "",
    cedula: "",
    nombres: "",
    correo: "",
    especialidad: "",
    estado: "Activo"
  };

  editando.value = false;
}

function obtenerNuevoId() {
  if (docentes.value.length === 0) {
    return 1;
  }

  const ids = docentes.value.map((item) => {
    return Number(item.id_docente);
  });

  return Math.max(...ids) + 1;
}

function validarFormulario() {
  const cedulaDuplicada = docentes.value.some((item) => {
    return (
      item.cedula === form.value.cedula &&
      Number(item.id_docente) !== Number(form.value.id_docente)
    );
  });

  if (cedulaDuplicada) {
    alert("Ya existe un docente con esa cédula.");
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