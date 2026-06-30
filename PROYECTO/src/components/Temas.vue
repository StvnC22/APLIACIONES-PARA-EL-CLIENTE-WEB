<template>
  <section class="page">
    <div class="page-title">
      <div>
        <h2>Temas de Titulación</h2>
        <p>Registro y control de temas seleccionados por los estudiantes.</p>
      </div>
    </div>

    <div class="layout-two">
      <form class="card" @submit.prevent="guardarTema">
        <h3>{{ editando ? "Editar tema" : "Nuevo tema" }}</h3>
        <input type="hidden" v-model="form.id_tema" />

        <div class="form-grid">
          <SelectorEstudiante v-model="form.id_estudiante" :estudiantes="estudiantes" label="Buscar estudiante *" />

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

          <div class="field full-field"><label>Título del tema *</label><input v-model="form.titulo" required /></div>
          <div class="field"><label>Fecha de propuesta *</label><input v-model="form.fecha_propuesta" type="date" required /></div>

          <div class="field">
            <label>Estado *</label>
            <select v-model="form.estado" required>
              <option>Pendiente</option><option>Aprobado</option><option>Observado</option><option>Rechazado</option>
            </select>
          </div>

          <div class="field full-field"><label>Descripción *</label><textarea v-model="form.descripcion" required></textarea></div>
          <div class="field full-field"><label>Observaciones</label><textarea v-model="form.observaciones"></textarea></div>
        </div>

        <div class="form-actions">
          <button class="btn primary" type="submit">{{ editando ? "Actualizar" : "Guardar" }}</button>
          <button class="btn neutral" type="button" @click="limpiarFormulario">Limpiar</button>
        </div>
      </form>

      <div class="card">
        <div class="table-header">
          <h3>Listado de temas</h3>
          <div class="filter-row">
            <input v-model="busqueda" placeholder="Buscar tema..." />
            <select v-model="ordenLista"><option value="reciente">Más reciente primero</option><option value="antiguo">Más antiguo primero</option></select>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead><tr><th>Estudiante</th><th>Carrera</th><th>Nivel</th><th>Tema</th><th>Línea</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              <tr v-for="tema in temasFiltrados" :key="tema.id_tema">
                <td>{{ obtenerNombreEstudiante(tema.id_estudiante) }}</td><td>{{ obtenerCarreraEstudiante(tema.id_estudiante) }}</td><td>{{ obtenerNivelEstudiante(tema.id_estudiante) }}</td>
                <td>{{ tema.titulo }}</td><td>{{ tema.linea_investigacion }}</td><td>{{ tema.fecha_propuesta }}</td><td><span class="badge">{{ tema.estado }}</span></td>
                <td><button class="action-btn edit" @click="editarTema(tema)">Editar</button><button class="action-btn delete" @click="eliminarTema(tema.id_tema)">Eliminar</button></td>
              </tr>
              <tr v-if="temasFiltrados.length === 0"><td colspan="8">No se encontraron temas registrados.</td></tr>
            </tbody>
          </table>
        </div>

        <p class="summary-text">Total de temas: {{ temas.length }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { cargarCSV } from "../services/csvService";
import SelectorEstudiante from "./SelectorEstudiante.vue";

const estudiantes = ref([]);
const temas = ref([]);
const busqueda = ref("");
const ordenLista = ref("reciente");
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
  const texto = limpiarTexto(busqueda.value);
  const filtrados = temas.value.filter((item) => limpiarTexto(`
    ${obtenerNombreEstudiante(item.id_estudiante)} ${obtenerCarreraEstudiante(item.id_estudiante)}
    ${obtenerNivelEstudiante(item.id_estudiante)} ${item.titulo} ${item.linea_investigacion}
    ${item.fecha_propuesta} ${item.estado}
  `).includes(texto));

  return ordenarPorFecha(filtrados, "fecha_propuesta");
});

onMounted(() => { cargarEstudiantes(); cargarTemas(); });

async function cargarEstudiantes() {
  const datosGuardados = localStorage.getItem("estudiantes_vue");
  if (datosGuardados) { estudiantes.value = JSON.parse(datosGuardados); return; }
  estudiantes.value = await cargarCSV("/data/estudiantes.csv");
  localStorage.setItem("estudiantes_vue", JSON.stringify(estudiantes.value));
}

async function cargarTemas() {
  const datosGuardados = localStorage.getItem("temas_vue");
  if (datosGuardados) { temas.value = JSON.parse(datosGuardados); return; }
  temas.value = await cargarCSV("/data/temas.csv");
  guardarEnLocalStorage();
}

function guardarEnLocalStorage() { localStorage.setItem("temas_vue", JSON.stringify(temas.value)); }

function guardarTema() {
  if (!validarFormulario()) return;
  editando.value ? actualizarTema() : agregarTema();
  guardarEnLocalStorage();
  limpiarFormulario();
}

function agregarTema() { temas.value.push({ ...form.value, id_tema: obtenerNuevoId() }); }

function actualizarTema() {
  const index = temas.value.findIndex((item) => Number(item.id_tema) === Number(form.value.id_tema));
  if (index !== -1) temas.value[index] = { ...form.value };
}

function editarTema(tema) { form.value = { ...tema }; editando.value = true; window.scrollTo({ top: 0, behavior: "smooth" }); }

function eliminarTema(id) {
  if (!confirm("¿Seguro que deseas eliminar este tema?")) return;
  temas.value = temas.value.filter((item) => Number(item.id_tema) !== Number(id));
  guardarEnLocalStorage();
}

function limpiarFormulario() {
  form.value = { id_tema: "", id_estudiante: "", titulo: "", linea_investigacion: "", descripcion: "", fecha_propuesta: new Date().toISOString().slice(0, 10), estado: "Pendiente", observaciones: "" };
  editando.value = false;
}

function obtenerNuevoId() { return temas.value.length ? Math.max(...temas.value.map((item) => Number(item.id_tema))) + 1 : 1; }

function validarFormulario() {
  const temaDuplicado = temas.value.some((item) => Number(item.id_estudiante) === Number(form.value.id_estudiante) && Number(item.id_tema) !== Number(form.value.id_tema));
  if (temaDuplicado) { alert("Este estudiante ya tiene un tema registrado."); return false; }
  return true;
}

function obtenerEstudiante(id) { return estudiantes.value.find((item) => Number(item.id_estudiante) === Number(id)); }
function obtenerNombreEstudiante(id) { const e = obtenerEstudiante(id); return e ? `${e.nombres} ${e.apellidos}` : "Estudiante no encontrado"; }
function obtenerCarreraEstudiante(id) { const e = obtenerEstudiante(id); return e ? e.carrera : "Sin carrera"; }
function obtenerNivelEstudiante(id) { const e = obtenerEstudiante(id); return e ? e.nivel : "Sin nivel"; }

function ordenarPorFecha(lista, campoFecha) {
  return [...lista].sort((a, b) => {
    const fechaA = new Date(a[campoFecha] || "1900-01-01").getTime();
    const fechaB = new Date(b[campoFecha] || "1900-01-01").getTime();
    return ordenLista.value === "reciente" ? fechaB - fechaA : fechaA - fechaB;
  });
}

function limpiarTexto(texto) { return String(texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(); }
</script>
