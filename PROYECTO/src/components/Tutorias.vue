<template>
  <section class="page">
    <div class="page-title">
      <div><h2>Control de Tutorías</h2><p>Registro de sesiones de tutoría, asistencia, actividades y compromisos.</p></div>
    </div>

    <div class="layout-two">
      <form class="card" @submit.prevent="guardarTutoria">
        <h3>{{ editando ? "Editar tutoría" : "Nueva tutoría" }}</h3>
        <input type="hidden" v-model="form.id_tutoria" />

        <div class="form-grid">
          <SelectorEstudiante v-model="form.id_estudiante" :estudiantes="estudiantes" label="Buscar estudiante *" />
          <SelectorDocente v-model="form.id_docente" :docentes="docentes" label="Buscar docente tutor *" />
          <div class="field"><label>Fecha *</label><input v-model="form.fecha" type="date" required /></div>
          <div class="field"><label>Hora *</label><input v-model="form.hora" type="time" required /></div>
          <div class="field"><label>Modalidad *</label><select v-model="form.modalidad" required><option>Presencial</option><option>Virtual</option></select></div>
          <div class="field"><label>Asistencia *</label><select v-model="form.asistencia" required><option>Asistió</option><option>No asistió</option><option>Justificado</option></select></div>
          <div class="field full-field"><label>Tema tratado *</label><input v-model="form.tema_tratado" required /></div>
          <div class="field full-field"><label>Actividades realizadas *</label><textarea v-model="form.actividades" required></textarea></div>
          <div class="field full-field"><label>Compromisos *</label><textarea v-model="form.compromisos" required></textarea></div>
          <div class="field"><label>Próxima tutoría</label><input v-model="form.proxima_tutoria" type="date" /></div>
          <div class="field full-field"><label>Observaciones</label><textarea v-model="form.observaciones"></textarea></div>
        </div>

        <div class="form-actions">
          <button class="btn primary" type="submit">{{ editando ? "Actualizar" : "Guardar" }}</button>
          <button class="btn neutral" type="button" @click="limpiarFormulario">Limpiar</button>
        </div>
      </form>

      <div class="card">
        <div class="table-header">
          <h3>Listado de tutorías</h3>
          <div class="filter-row">
            <input v-model="busqueda" placeholder="Buscar tutoría..." />
            <select v-model="ordenLista"><option value="reciente">Más reciente primero</option><option value="antiguo">Más antiguo primero</option></select>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead><tr><th>Estudiante</th><th>Cédula</th><th>Carrera</th><th>Nivel</th><th>Docente</th><th>Facultad Docente</th><th>Especialidad</th><th>Fecha</th><th>Modalidad</th><th>Asistencia</th><th>Acciones</th></tr></thead>
            <tbody>
              <tr v-for="tutoria in tutoriasFiltradas" :key="tutoria.id_tutoria">
                <td>{{ obtenerNombreEstudiante(tutoria.id_estudiante) }}</td><td>{{ obtenerCedulaEstudiante(tutoria.id_estudiante) }}</td><td>{{ obtenerCarreraEstudiante(tutoria.id_estudiante) }}</td><td>{{ obtenerNivelEstudiante(tutoria.id_estudiante) }}</td>
                <td>{{ obtenerNombreDocente(tutoria.id_docente) }}</td><td>{{ obtenerFacultadDocente(tutoria.id_docente) }}</td><td>{{ obtenerEspecialidadDocente(tutoria.id_docente) }}</td>
                <td>{{ tutoria.fecha }}</td><td>{{ tutoria.modalidad }}</td><td><span class="badge">{{ tutoria.asistencia }}</span></td>
                <td><button class="action-btn edit" @click="editarTutoria(tutoria)">Editar</button><button class="action-btn delete" @click="eliminarTutoria(tutoria.id_tutoria)">Eliminar</button></td>
              </tr>
              <tr v-if="tutoriasFiltradas.length === 0"><td colspan="11">No se encontraron tutorías.</td></tr>
            </tbody>
          </table>
        </div>
        <p class="summary-text">Total de tutorías: {{ tutorias.length }}</p>
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
const tutorias = ref([]);
const busqueda = ref("");
const ordenLista = ref("reciente");
const editando = ref(false);

const form = ref({ id_tutoria: "", id_estudiante: "", id_docente: "", fecha: new Date().toISOString().slice(0, 10), hora: "09:00", modalidad: "Presencial", tema_tratado: "", actividades: "", compromisos: "", proxima_tutoria: "", asistencia: "Asistió", observaciones: "" });

const tutoriasFiltradas = computed(() => {
  const texto = limpiarTexto(busqueda.value);
  const filtradas = tutorias.value.filter((item) => limpiarTexto(`
    ${obtenerNombreEstudiante(item.id_estudiante)} ${obtenerCedulaEstudiante(item.id_estudiante)}
    ${obtenerCarreraEstudiante(item.id_estudiante)} ${obtenerNivelEstudiante(item.id_estudiante)}
    ${obtenerNombreDocente(item.id_docente)} ${obtenerFacultadDocente(item.id_docente)}
    ${obtenerEspecialidadDocente(item.id_docente)} ${item.fecha} ${item.hora} ${item.modalidad}
    ${item.asistencia} ${item.tema_tratado} ${item.actividades} ${item.compromisos}
  `).includes(texto));
  return ordenarPorFecha(filtradas, "fecha");
});

onMounted(() => { cargarEstudiantes(); cargarDocentes(); cargarTutorias(); });

async function obtenerDatos(clave, ruta) { const g = localStorage.getItem(clave); if (g) return JSON.parse(g); const d = await cargarCSV(ruta); localStorage.setItem(clave, JSON.stringify(d)); return d; }
async function cargarEstudiantes() { estudiantes.value = await obtenerDatos("estudiantes_vue", "/data/estudiantes.csv"); }
async function cargarDocentes() { docentes.value = await obtenerDatos("docentes_vue", "/data/docentes.csv"); }
async function cargarTutorias() { tutorias.value = await obtenerDatos("tutorias_vue", "/data/tutorias.csv"); }
function guardarEnLocalStorage() { localStorage.setItem("tutorias_vue", JSON.stringify(tutorias.value)); }

function guardarTutoria() { if (!validarFormulario()) return; editando.value ? actualizarTutoria() : agregarTutoria(); guardarEnLocalStorage(); limpiarFormulario(); }
function agregarTutoria() { tutorias.value.push({ ...form.value, id_tutoria: obtenerNuevoId() }); }
function actualizarTutoria() { const i = tutorias.value.findIndex((item) => Number(item.id_tutoria) === Number(form.value.id_tutoria)); if (i !== -1) tutorias.value[i] = { ...form.value }; }
function editarTutoria(tutoria) { form.value = { ...tutoria }; editando.value = true; window.scrollTo({ top: 0, behavior: "smooth" }); }
function eliminarTutoria(id) { if (!confirm("¿Seguro que deseas eliminar esta tutoría?")) return; tutorias.value = tutorias.value.filter((item) => Number(item.id_tutoria) !== Number(id)); guardarEnLocalStorage(); }
function limpiarFormulario() { form.value = { id_tutoria: "", id_estudiante: "", id_docente: "", fecha: new Date().toISOString().slice(0, 10), hora: "09:00", modalidad: "Presencial", tema_tratado: "", actividades: "", compromisos: "", proxima_tutoria: "", asistencia: "Asistió", observaciones: "" }; editando.value = false; }
function obtenerNuevoId() { return tutorias.value.length ? Math.max(...tutorias.value.map((item) => Number(item.id_tutoria))) + 1 : 1; }
function validarFormulario() { if (!form.value.id_estudiante) { alert("Debe seleccionar un estudiante."); return false; } if (!form.value.id_docente) { alert("Debe seleccionar un docente tutor."); return false; } return true; }

function obtenerEstudiante(id) { return estudiantes.value.find((item) => Number(item.id_estudiante) === Number(id)); }
function obtenerDocente(id) { return docentes.value.find((item) => Number(item.id_docente) === Number(id)); }
function obtenerNombreEstudiante(id) { const e = obtenerEstudiante(id); return e ? `${e.nombres} ${e.apellidos}` : "Estudiante no encontrado"; }
function obtenerCedulaEstudiante(id) { const e = obtenerEstudiante(id); return e ? e.cedula : "Sin cédula"; }
function obtenerCarreraEstudiante(id) { const e = obtenerEstudiante(id); return e ? e.carrera : "Sin carrera"; }
function obtenerNivelEstudiante(id) { const e = obtenerEstudiante(id); return e ? e.nivel : "Sin nivel"; }
function obtenerNombreDocente(id) { const d = obtenerDocente(id); return d ? d.nombres : "Docente no encontrado"; }
function obtenerFacultadDocente(id) { const d = obtenerDocente(id); return d ? d.facultad : "Sin facultad"; }
function obtenerEspecialidadDocente(id) { const d = obtenerDocente(id); return d ? d.especialidad : "Sin especialidad"; }
function ordenarPorFecha(lista, campoFecha) { return [...lista].sort((a, b) => ordenLista.value === "reciente" ? new Date(b[campoFecha] || "1900-01-01") - new Date(a[campoFecha] || "1900-01-01") : new Date(a[campoFecha] || "1900-01-01") - new Date(b[campoFecha] || "1900-01-01")); }
function limpiarTexto(texto) { return String(texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(); }
</script>
