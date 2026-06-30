<template>
  <section class="page">
    <div class="page-title">
      <div><h2>Asignación de Tutor</h2><p>Asignación de docentes tutores a estudiantes en proceso de titulación.</p></div>
    </div>

    <div class="layout-two">
      <form class="card" @submit.prevent="guardarAsignacion">
        <h3>{{ editando ? "Editar asignación" : "Nueva asignación" }}</h3>
        <input type="hidden" v-model="form.id_asignacion" />

        <div class="form-grid">
          <SelectorEstudiante v-model="form.id_estudiante" :estudiantes="estudiantes" label="Buscar estudiante *" />
          <SelectorDocente v-model="form.id_docente" :docentes="docentes" label="Buscar docente tutor *" />
          <div class="field"><label>Fecha de asignación *</label><input v-model="form.fecha_asignacion" type="date" required /></div>
          <div class="field">
            <label>Estado *</label>
            <select v-model="form.estado" required><option>Asignado</option><option>Pendiente</option><option>Finalizado</option><option>Cancelado</option></select>
          </div>
          <div class="field full-field"><label>Observaciones</label><textarea v-model="form.observaciones"></textarea></div>
        </div>

        <div class="form-actions">
          <button class="btn primary" type="submit">{{ editando ? "Actualizar" : "Guardar" }}</button>
          <button class="btn neutral" type="button" @click="limpiarFormulario">Limpiar</button>
        </div>
      </form>

      <div class="card">
        <div class="table-header">
          <h3>Listado de asignaciones</h3>
          <div class="filter-row">
            <input v-model="busqueda" placeholder="Buscar asignación..." />
            <select v-model="ordenLista"><option value="reciente">Más reciente primero</option><option value="antiguo">Más antiguo primero</option></select>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead><tr><th>Estudiante</th><th>Carrera</th><th>Nivel</th><th>Docente</th><th>Facultad Docente</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              <tr v-for="asignacion in asignacionesFiltradas" :key="asignacion.id_asignacion">
                <td>{{ obtenerNombreEstudiante(asignacion.id_estudiante) }}</td>
                <td>{{ obtenerCarreraEstudiante(asignacion.id_estudiante) }}</td>
                <td>{{ obtenerNivelEstudiante(asignacion.id_estudiante) }}</td>
                <td>{{ obtenerNombreDocente(asignacion.id_docente) }}</td>
                <td>{{ obtenerFacultadDocente(asignacion.id_docente) }}</td>
                <td>{{ asignacion.fecha_asignacion }}</td>
                <td><span class="badge">{{ asignacion.estado }}</span></td>
                <td><button class="action-btn edit" @click="editarAsignacion(asignacion)">Editar</button><button class="action-btn delete" @click="eliminarAsignacion(asignacion.id_asignacion)">Eliminar</button></td>
              </tr>
              <tr v-if="asignacionesFiltradas.length === 0"><td colspan="8">No se encontraron asignaciones.</td></tr>
            </tbody>
          </table>
        </div>

        <p class="summary-text">Total de asignaciones: {{ asignaciones.length }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { cargarCSV } from "../services/csvService";
import SelectorEstudiante from "./SelectorEstudiante.vue";
import SelectorDocente from "./SelectorDocente.vue";

const estudiantes = ref([]);
const docentes = ref([]);
const asignaciones = ref([]);
const busqueda = ref("");
const ordenLista = ref("reciente");
const editando = ref(false);

const form = ref({ id_asignacion: "", id_estudiante: "", id_docente: "", fecha_asignacion: new Date().toISOString().slice(0, 10), estado: "Asignado", observaciones: "" });

const asignacionesFiltradas = computed(() => {
  const texto = limpiarTexto(busqueda.value);
  const filtradas = asignaciones.value.filter((item) => limpiarTexto(`
    ${obtenerNombreEstudiante(item.id_estudiante)} ${obtenerCarreraEstudiante(item.id_estudiante)}
    ${obtenerNivelEstudiante(item.id_estudiante)} ${obtenerNombreDocente(item.id_docente)}
    ${obtenerFacultadDocente(item.id_docente)} ${item.fecha_asignacion} ${item.estado} ${item.observaciones}
  `).includes(texto));

  return ordenarPorFecha(filtradas, "fecha_asignacion");
});

onMounted(() => { cargarEstudiantes(); cargarDocentes(); cargarAsignaciones(); });

async function obtenerDatos(clave, ruta) {
  const guardado = localStorage.getItem(clave);
  if (guardado) return JSON.parse(guardado);
  const datos = await cargarCSV(ruta);
  localStorage.setItem(clave, JSON.stringify(datos));
  return datos;
}
async function cargarEstudiantes() { estudiantes.value = await obtenerDatos("estudiantes_vue", "/data/estudiantes.csv"); }
async function cargarDocentes() { docentes.value = await obtenerDatos("docentes_vue", "/data/docentes.csv"); }
async function cargarAsignaciones() { asignaciones.value = await obtenerDatos("asignaciones_vue", "/data/asignaciones.csv"); }

function guardarEnLocalStorage() { localStorage.setItem("asignaciones_vue", JSON.stringify(asignaciones.value)); }

function guardarAsignacion() {
  if (!validarFormulario()) return;
  editando.value ? actualizarAsignacion() : agregarAsignacion();
  guardarEnLocalStorage();
  limpiarFormulario();
}

function agregarAsignacion() { asignaciones.value.push({ ...form.value, id_asignacion: obtenerNuevoId() }); }
function actualizarAsignacion() { const i = asignaciones.value.findIndex((item) => Number(item.id_asignacion) === Number(form.value.id_asignacion)); if (i !== -1) asignaciones.value[i] = { ...form.value }; }
function editarAsignacion(asignacion) { form.value = { ...asignacion }; editando.value = true; window.scrollTo({ top: 0, behavior: "smooth" }); }
function eliminarAsignacion(id) { if (!confirm("¿Seguro que deseas eliminar esta asignación?")) return; asignaciones.value = asignaciones.value.filter((item) => Number(item.id_asignacion) !== Number(id)); guardarEnLocalStorage(); }
function limpiarFormulario() { form.value = { id_asignacion: "", id_estudiante: "", id_docente: "", fecha_asignacion: new Date().toISOString().slice(0, 10), estado: "Asignado", observaciones: "" }; editando.value = false; }
function obtenerNuevoId() { return asignaciones.value.length ? Math.max(...asignaciones.value.map((item) => Number(item.id_asignacion))) + 1 : 1; }

function validarFormulario() {
  const existe = asignaciones.value.some((item) => Number(item.id_estudiante) === Number(form.value.id_estudiante) && Number(item.id_asignacion) !== Number(form.value.id_asignacion) && item.estado === "Asignado");
  if (existe) { alert("Este estudiante ya tiene un tutor asignado."); return false; }
  return true;
}

function obtenerEstudiante(id) { return estudiantes.value.find((item) => Number(item.id_estudiante) === Number(id)); }
function obtenerDocente(id) { return docentes.value.find((item) => Number(item.id_docente) === Number(id)); }
function obtenerNombreEstudiante(id) { const e = obtenerEstudiante(id); return e ? `${e.nombres} ${e.apellidos}` : "Estudiante no encontrado"; }
function obtenerCarreraEstudiante(id) { const e = obtenerEstudiante(id); return e ? e.carrera : "Sin carrera"; }
function obtenerNivelEstudiante(id) { const e = obtenerEstudiante(id); return e ? e.nivel : "Sin nivel"; }
function obtenerNombreDocente(id) { const d = obtenerDocente(id); return d ? d.nombres : "Docente no encontrado"; }
function obtenerFacultadDocente(id) { const d = obtenerDocente(id); return d ? d.facultad : "Sin facultad"; }
function ordenarPorFecha(lista, campoFecha) { return [...lista].sort((a, b) => ordenLista.value === "reciente" ? new Date(b[campoFecha] || "1900-01-01") - new Date(a[campoFecha] || "1900-01-01") : new Date(a[campoFecha] || "1900-01-01") - new Date(b[campoFecha] || "1900-01-01")); }
function limpiarTexto(texto) { return String(texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(); }
</script>
