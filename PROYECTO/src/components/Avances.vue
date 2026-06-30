<template>
  <section class="page">
    <div class="page-title">
      <div><h2>Avances y Borradores</h2><p>Control de entregas, revisiones y observaciones del trabajo de titulación.</p></div>
    </div>

    <div class="layout-two">
      <form class="card" @submit.prevent="guardarAvance">
        <h3>{{ editando ? "Editar avance" : "Nuevo avance" }}</h3>
        <input type="hidden" v-model="form.id_avance" />

        <div class="form-grid">
          <SelectorEstudiante v-model="form.id_estudiante" :estudiantes="estudiantes" label="Buscar estudiante *" />
          <div class="field"><label>Número de avance *</label><select v-model="form.numero_avance" required><option value="">Seleccione</option><option value="1">Avance 1</option><option value="2">Avance 2</option><option value="3">Avance 3</option><option value="4">Avance 4</option><option value="5">Avance 5</option><option value="6">Avance 6</option></select></div>
          <div class="field"><label>Tipo de documento *</label><select v-model="form.tipo_documento" required><option value="">Seleccione</option><option>Propuesta de tema</option><option>Capítulo I</option><option>Capítulo II</option><option>Capítulo III</option><option>Borrador parcial</option><option>Borrador final</option><option>Trabajo final</option></select></div>
          <div class="field"><label>Fecha de entrega *</label><input v-model="form.fecha_entrega" type="date" required /></div>
          <div class="field"><label>Estado *</label><select v-model="form.estado" required><option>Pendiente</option><option>Entregado</option><option>Observado</option><option>Corregido</option><option>Aprobado</option></select></div>
          <div class="field"><label>Archivo</label><input v-model="form.archivo" placeholder="Ejemplo: avance_1.pdf" /></div>
          <div class="field"><label>Fecha de revisión</label><input v-model="form.fecha_revision" type="date" /></div>
          <div class="field full-field"><label>Comentario del tutor *</label><textarea v-model="form.comentario_tutor" required></textarea></div>
        </div>

        <div class="form-actions">
          <button class="btn primary" type="submit">{{ editando ? "Actualizar" : "Guardar" }}</button>
          <button class="btn neutral" type="button" @click="limpiarFormulario">Limpiar</button>
        </div>
      </form>

      <div class="card">
        <div class="table-header">
          <h3>Listado de avances</h3>
          <div class="filter-row">
            <input v-model="busqueda" placeholder="Buscar avance..." />
            <select v-model="ordenLista"><option value="reciente">Más reciente primero</option><option value="antiguo">Más antiguo primero</option></select>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead><tr><th>Estudiante</th><th>Carrera</th><th>Nivel</th><th>Avance</th><th>Documento</th><th>Entrega</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              <tr v-for="avance in avancesFiltrados" :key="avance.id_avance">
                <td>{{ obtenerNombreEstudiante(avance.id_estudiante) }}</td><td>{{ obtenerCarreraEstudiante(avance.id_estudiante) }}</td><td>{{ obtenerNivelEstudiante(avance.id_estudiante) }}</td>
                <td>Avance {{ avance.numero_avance }}</td><td>{{ avance.tipo_documento }}</td><td>{{ avance.fecha_entrega }}</td><td><span class="badge">{{ avance.estado }}</span></td>
                <td><button class="action-btn edit" @click="editarAvance(avance)">Editar</button><button class="action-btn delete" @click="eliminarAvance(avance.id_avance)">Eliminar</button></td>
              </tr>
              <tr v-if="avancesFiltrados.length === 0"><td colspan="8">No se encontraron avances.</td></tr>
            </tbody>
          </table>
        </div>
        <p class="summary-text">Total de avances: {{ avances.length }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { cargarCSV } from "../services/csvService";
import SelectorEstudiante from "./SelectorEstudiante.vue";

const estudiantes = ref([]);
const avances = ref([]);
const busqueda = ref("");
const ordenLista = ref("reciente");
const editando = ref(false);

const form = ref({ id_avance: "", id_estudiante: "", numero_avance: "", tipo_documento: "", fecha_entrega: new Date().toISOString().slice(0, 10), estado: "Pendiente", comentario_tutor: "", archivo: "", fecha_revision: "" });

const avancesFiltrados = computed(() => {
  const texto = limpiarTexto(busqueda.value);
  const filtrados = avances.value.filter((item) => limpiarTexto(`
    ${obtenerNombreEstudiante(item.id_estudiante)} ${obtenerCarreraEstudiante(item.id_estudiante)}
    ${obtenerNivelEstudiante(item.id_estudiante)} ${item.numero_avance} ${item.tipo_documento}
    ${item.fecha_entrega} ${item.estado} ${item.comentario_tutor}
  `).includes(texto));
  return ordenarPorFecha(filtrados, "fecha_entrega");
});

onMounted(() => { cargarEstudiantes(); cargarAvances(); });

async function obtenerDatos(clave, ruta) { const g = localStorage.getItem(clave); if (g) return JSON.parse(g); const d = await cargarCSV(ruta); localStorage.setItem(clave, JSON.stringify(d)); return d; }
async function cargarEstudiantes() { estudiantes.value = await obtenerDatos("estudiantes_vue", "/data/estudiantes.csv"); }
async function cargarAvances() { avances.value = await obtenerDatos("avances_vue", "/data/avances.csv"); }
function guardarEnLocalStorage() { localStorage.setItem("avances_vue", JSON.stringify(avances.value)); }

function guardarAvance() { if (!validarFormulario()) return; editando.value ? actualizarAvance() : agregarAvance(); guardarEnLocalStorage(); limpiarFormulario(); }
function agregarAvance() { avances.value.push({ ...form.value, id_avance: obtenerNuevoId() }); }
function actualizarAvance() { const i = avances.value.findIndex((item) => Number(item.id_avance) === Number(form.value.id_avance)); if (i !== -1) avances.value[i] = { ...form.value }; }
function editarAvance(avance) { form.value = { ...avance }; editando.value = true; window.scrollTo({ top: 0, behavior: "smooth" }); }
function eliminarAvance(id) { if (!confirm("¿Seguro que deseas eliminar este avance?")) return; avances.value = avances.value.filter((item) => Number(item.id_avance) !== Number(id)); guardarEnLocalStorage(); }
function limpiarFormulario() { form.value = { id_avance: "", id_estudiante: "", numero_avance: "", tipo_documento: "", fecha_entrega: new Date().toISOString().slice(0, 10), estado: "Pendiente", comentario_tutor: "", archivo: "", fecha_revision: "" }; editando.value = false; }
function obtenerNuevoId() { return avances.value.length ? Math.max(...avances.value.map((item) => Number(item.id_avance))) + 1 : 1; }

function validarFormulario() {
  if (!form.value.id_estudiante) { alert("Debe seleccionar un estudiante."); return false; }
  if (!form.value.numero_avance) { alert("Debe seleccionar el número de avance."); return false; }
  if (!form.value.tipo_documento) { alert("Debe seleccionar el tipo de documento."); return false; }
  const existe = avances.value.some((item) => Number(item.id_estudiante) === Number(form.value.id_estudiante) && Number(item.numero_avance) === Number(form.value.numero_avance) && Number(item.id_avance) !== Number(form.value.id_avance));
  if (existe) { alert("Este estudiante ya tiene registrado ese número de avance."); return false; }
  return true;
}

function obtenerEstudiante(id) { return estudiantes.value.find((item) => Number(item.id_estudiante) === Number(id)); }
function obtenerNombreEstudiante(id) { const e = obtenerEstudiante(id); return e ? `${e.nombres} ${e.apellidos}` : "Estudiante no encontrado"; }
function obtenerCarreraEstudiante(id) { const e = obtenerEstudiante(id); return e ? e.carrera : "Sin carrera"; }
function obtenerNivelEstudiante(id) { const e = obtenerEstudiante(id); return e ? e.nivel : "Sin nivel"; }
function ordenarPorFecha(lista, campoFecha) { return [...lista].sort((a, b) => ordenLista.value === "reciente" ? new Date(b[campoFecha] || "1900-01-01") - new Date(a[campoFecha] || "1900-01-01") : new Date(a[campoFecha] || "1900-01-01") - new Date(b[campoFecha] || "1900-01-01")); }
function limpiarTexto(texto) { return String(texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(); }
</script>
