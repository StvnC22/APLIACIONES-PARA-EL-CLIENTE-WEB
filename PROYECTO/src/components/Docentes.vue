<template>
  <section class="page">
    <div class="page-title">
      <div>
        <h2>Registro de Docentes</h2>
        <p>Gestión de docentes tutores para trabajos de titulación.</p>
      </div>
    </div>

    <div class="layout-two">
      <form class="card" @submit.prevent="guardarDocente">
        <h3>{{ editando ? "Editar docente" : "Nuevo docente" }}</h3>
        <input type="hidden" v-model="form.id_docente" />

        <div class="form-grid">
          <div class="field"><label>Cédula *</label><input v-model="form.cedula" maxlength="10" required /></div>
          <div class="field"><label>Nombres *</label><input v-model="form.nombres" required /></div>
          <div class="field"><label>Correo *</label><input v-model="form.correo" type="email" required /></div>

          <div class="field">
            <label>Facultad *</label>
            <select v-model="form.facultad" required>
              <option value="">Seleccione facultad</option>
              <option v-for="facultad in facultades" :key="facultad" :value="facultad">{{ facultad }}</option>
            </select>
          </div>

          <div class="field"><label>Especialidad *</label><input v-model="form.especialidad" required /></div>

          <div class="field">
            <label>Estado *</label>
            <select v-model="form.estado" required>
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn primary" type="submit">{{ editando ? "Actualizar" : "Guardar" }}</button>
          <button class="btn neutral" type="button" @click="limpiarFormulario">Limpiar</button>
        </div>
      </form>

      <div class="card">
        <div class="table-header">
          <h3>Listado de docentes</h3>
          <div class="filter-row">
            <input v-model="busqueda" placeholder="Buscar docente..." />
            <select v-model="ordenLista">
              <option value="reciente">Más reciente primero</option>
              <option value="antiguo">Más antiguo primero</option>
            </select>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Cédula</th><th>Docente</th><th>Correo</th><th>Facultad</th><th>Especialidad</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              <tr v-for="docente in docentesFiltrados" :key="docente.id_docente">
                <td>{{ docente.cedula }}</td><td>{{ docente.nombres }}</td><td>{{ docente.correo }}</td>
                <td>{{ docente.facultad }}</td><td>{{ docente.especialidad }}</td><td><span class="badge">{{ docente.estado }}</span></td>
                <td>
                  <button class="action-btn edit" @click="editarDocente(docente)">Editar</button>
                  <button class="action-btn delete" @click="eliminarDocente(docente.id_docente)">Eliminar</button>
                </td>
              </tr>
              <tr v-if="docentesFiltrados.length === 0"><td colspan="7">No se encontraron docentes.</td></tr>
            </tbody>
          </table>
        </div>

        <p class="summary-text">Total de docentes: {{ docentes.length }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { cargarCSV } from "../services/csvService";
import { facultades } from "../data/facultades.js";

const docentes = ref([]);
const busqueda = ref("");
const ordenLista = ref("reciente");
const editando = ref(false);

const form = ref({
  id_docente: "",
  cedula: "",
  nombres: "",
  correo: "",
  facultad: "",
  especialidad: "",
  estado: "Activo"
});

const docentesFiltrados = computed(() => {
  const texto = limpiarTexto(busqueda.value);
  const filtrados = docentes.value.filter((item) => limpiarTexto(`
    ${item.cedula} ${item.nombres} ${item.correo} ${item.facultad}
    ${item.especialidad} ${item.estado}
  `).includes(texto));

  return filtrados.sort((a, b) => {
    const idA = Number(a.id_docente);
    const idB = Number(b.id_docente);
    return ordenLista.value === "reciente" ? idB - idA : idA - idB;
  });
});

onMounted(cargarDocentes);

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
  localStorage.setItem("docentes_vue", JSON.stringify(docentes.value));
}

function guardarDocente() {
  if (!validarFormulario()) return;
  editando.value ? actualizarDocente() : agregarDocente();
  guardarEnLocalStorage();
  limpiarFormulario();
}

function agregarDocente() {
  docentes.value.push({ ...form.value, id_docente: obtenerNuevoId() });
}

function actualizarDocente() {
  const index = docentes.value.findIndex((item) => Number(item.id_docente) === Number(form.value.id_docente));
  if (index !== -1) docentes.value[index] = { ...form.value };
}

function editarDocente(docente) {
  form.value = { ...docente };
  editando.value = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function eliminarDocente(id) {
  if (!confirm("¿Seguro que deseas eliminar este docente?")) return;
  docentes.value = docentes.value.filter((item) => Number(item.id_docente) !== Number(id));
  guardarEnLocalStorage();
}

function limpiarFormulario() {
  form.value = {
    id_docente: "",
    cedula: "",
    nombres: "",
    correo: "",
    facultad: "",
    especialidad: "",
    estado: "Activo"
  };
  editando.value = false;
}

function obtenerNuevoId() {
  if (!docentes.value.length) return 1;
  return Math.max(...docentes.value.map((item) => Number(item.id_docente))) + 1;
}

function validarFormulario() {
  const cedulaDuplicada = docentes.value.some((item) => item.cedula === form.value.cedula && Number(item.id_docente) !== Number(form.value.id_docente));
  if (cedulaDuplicada) {
    alert("Ya existe un docente con esa cédula.");
    return false;
  }

  if (!/^[a-zA-Z0-9._%+-]+@live\.uleam\.edu\.ec$/.test(form.value.correo)) {
    alert("El correo debe tener el formato usuario@live.uleam.edu.ec");
    return false;
  }

  if (!form.value.facultad) {
    alert("Debe seleccionar la facultad del docente.");
    return false;
  }

  return true;
}

function limpiarTexto(texto) {
  return String(texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}
</script>
