<template>
  <section class="page">
    <div class="page-title">
      <div>
        <h2>Registro de Estudiantes</h2>
        <p>Gestión de estudiantes en proceso de titulación.</p>
      </div>
    </div>

    <div class="layout-two">
      <form class="card" @submit.prevent="guardarEstudiante">
        <h3>{{ editando ? "Editar estudiante" : "Nuevo estudiante" }}</h3>
        <input type="hidden" v-model="form.id_estudiante" />

        <div class="form-grid">
          <div class="field"><label>Cédula *</label><input v-model="form.cedula" maxlength="10" required /></div>
          <div class="field"><label>Nombres *</label><input v-model="form.nombres" required /></div>
          <div class="field"><label>Apellidos *</label><input v-model="form.apellidos" required /></div>

          <div class="field">
            <label>Carrera *</label>
            <select v-model="form.carrera" required @change="form.nivel = ''">
              <option value="">Seleccione</option>
              <option v-for="carrera in carreras" :key="carrera" :value="carrera">{{ carrera }}</option>
            </select>
          </div>

          <div class="field">
            <label>Nivel *</label>
            <select v-model="form.nivel" required>
              <option value="">{{ form.carrera ? "Seleccione nivel" : "Primero seleccione carrera" }}</option>
              <option v-for="nivel in nivelesDisponibles" :key="nivel" :value="nivel">{{ nivel }}</option>
            </select>
          </div>

          <div class="field"><label>Correo *</label><input v-model="form.correo" type="email" required /></div>
          <div class="field"><label>Teléfono *</label><input v-model="form.telefono" maxlength="10" required /></div>

          <div class="field">
            <label>Estado *</label>
            <select v-model="form.estado" required>
              <option>Activo</option>
              <option>En proceso de titulación</option>
              <option>Egresado</option>
            </select>
          </div>

          <div class="field"><label>Fecha de registro *</label><input v-model="form.fecha_registro" type="date" required /></div>
        </div>

        <div class="form-actions">
          <button class="btn primary" type="submit">{{ editando ? "Actualizar" : "Guardar" }}</button>
          <button class="btn neutral" type="button" @click="limpiarFormulario">Limpiar</button>
        </div>
      </form>

      <div class="card">
        <div class="table-header">
          <h3>Listado de estudiantes</h3>
          <div class="filter-row">
            <input v-model="busqueda" placeholder="Buscar estudiante..." />
            <select v-model="ordenLista">
              <option value="reciente">Más reciente primero</option>
              <option value="antiguo">Más antiguo primero</option>
            </select>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Cédula</th><th>Estudiante</th><th>Carrera</th><th>Nivel</th><th>Correo</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              <tr v-for="estudiante in estudiantesFiltrados" :key="estudiante.id_estudiante">
                <td>{{ estudiante.cedula }}</td>
                <td>{{ estudiante.nombres }} {{ estudiante.apellidos }}</td>
                <td>{{ estudiante.carrera }}</td>
                <td>{{ estudiante.nivel }}</td>
                <td>{{ estudiante.correo }}</td>
                <td>{{ estudiante.fecha_registro }}</td>
                <td><span class="badge">{{ estudiante.estado }}</span></td>
                <td>
                  <button class="action-btn edit" @click="editarEstudiante(estudiante)">Editar</button>
                  <button class="action-btn delete" @click="eliminarEstudiante(estudiante.id_estudiante)">Eliminar</button>
                </td>
              </tr>
              <tr v-if="estudiantesFiltrados.length === 0"><td colspan="8">No se encontraron estudiantes.</td></tr>
            </tbody>
          </table>
        </div>

        <p class="summary-text">Total de estudiantes: {{ estudiantes.length }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { carreras, obtenerNivelesPorCarrera } from "../data/carreras";
import { cargarCSV } from "../services/csvService";

const estudiantes = ref([]);
const busqueda = ref("");
const ordenLista = ref("reciente");
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

const nivelesDisponibles = computed(() => obtenerNivelesPorCarrera(form.value.carrera));

const estudiantesFiltrados = computed(() => {
  const texto = limpiarTexto(busqueda.value);
  const filtrados = estudiantes.value.filter((item) => limpiarTexto(`
    ${item.cedula} ${item.nombres} ${item.apellidos} ${item.carrera}
    ${item.nivel} ${item.correo} ${item.estado} ${item.fecha_registro}
  `).includes(texto));

  return ordenarPorFecha(filtrados, "fecha_registro");
});

onMounted(cargarEstudiantes);

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
  localStorage.setItem("estudiantes_vue", JSON.stringify(estudiantes.value));
}

function guardarEstudiante() {
  if (!validarFormulario()) return;
  editando.value ? actualizarEstudiante() : agregarEstudiante();
  guardarEnLocalStorage();
  limpiarFormulario();
}

function agregarEstudiante() {
  estudiantes.value.push({ ...form.value, id_estudiante: obtenerNuevoId() });
}

function actualizarEstudiante() {
  const index = estudiantes.value.findIndex((item) => Number(item.id_estudiante) === Number(form.value.id_estudiante));
  if (index !== -1) estudiantes.value[index] = { ...form.value };
}

function editarEstudiante(estudiante) {
  form.value = { ...estudiante };
  editando.value = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function eliminarEstudiante(id) {
  if (!confirm("¿Seguro que deseas eliminar este estudiante?")) return;
  estudiantes.value = estudiantes.value.filter((item) => Number(item.id_estudiante) !== Number(id));
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
  if (!estudiantes.value.length) return 1;
  return Math.max(...estudiantes.value.map((item) => Number(item.id_estudiante))) + 1;
}

function validarFormulario() {
  const nivelesValidos = obtenerNivelesPorCarrera(form.value.carrera);
  if (!nivelesValidos.includes(form.value.nivel)) {
    alert("El nivel seleccionado no corresponde a la duración de la carrera.");
    return false;
  }

  const cedulaDuplicada = estudiantes.value.some((item) => item.cedula === form.value.cedula && Number(item.id_estudiante) !== Number(form.value.id_estudiante));
  if (cedulaDuplicada) {
    alert("Ya existe un estudiante con esa cédula.");
    return false;
  }

  if (!/^[a-zA-Z0-9._%+-]+@live\.uleam\.edu\.ec$/.test(form.value.correo)) {
    alert("El correo debe tener el formato usuario@live.uleam.edu.ec");
    return false;
  }

  return true;
}

function ordenarPorFecha(lista, campoFecha) {
  return [...lista].sort((a, b) => {
    const fechaA = new Date(a[campoFecha] || "1900-01-01").getTime();
    const fechaB = new Date(b[campoFecha] || "1900-01-01").getTime();
    return ordenLista.value === "reciente" ? fechaB - fechaA : fechaA - fechaB;
  });
}

function limpiarTexto(texto) {
  return String(texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}
</script>
