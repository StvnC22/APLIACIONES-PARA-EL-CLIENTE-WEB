<template>
  <section class="page">

    <!-- TARJETAS ESTADÍSTICAS -->
    <div class="stats-grid">
      <div class="stat-card soft-blue">
        <span>Estudiantes</span>
        <strong>{{ estudiantes.length }}</strong>
        <p>Total registrados</p>
      </div>

      <div class="stat-card soft-green">
        <span>Docentes</span>
        <strong>{{ docentes.length }}</strong>
        <p>Tutores disponibles</p>
      </div>

      <div class="stat-card soft-purple">
        <span>Con tema</span>
        <strong>{{ totalConTema }}</strong>
        <p>Temas registrados</p>
      </div>

      <div class="stat-card soft-orange">
        <span>Sin tema</span>
        <strong>{{ totalSinTema }}</strong>
        <p>Pendientes de tema</p>
      </div>

      <div class="stat-card soft-pink">
        <span>Con tutor</span>
        <strong>{{ totalConTutor }}</strong>
        <p>Asignaciones activas</p>
      </div>

      <div class="stat-card soft-red">
        <span>Avances pendientes</span>
        <strong>{{ totalAvancesPendientes }}</strong>
        <p>Por revisar</p>
      </div>
    </div>

    <div class="layout-two">
      <!-- RESUMEN DE MÓDULOS -->
      <div class="card">
        <h3>Resumen por módulo</h3>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Módulo</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Estudiantes</td>
                <td>{{ estudiantes.length }}</td>
                <td><span class="badge">Cargado</span></td>
              </tr>

              <tr>
                <td>Docentes</td>
                <td>{{ docentes.length }}</td>
                <td><span class="badge">Cargado</span></td>
              </tr>

              <tr>
                <td>Temas</td>
                <td>{{ temas.length }}</td>
                <td><span class="badge">Cargado</span></td>
              </tr>

              <tr>
                <td>Asignaciones</td>
                <td>{{ asignaciones.length }}</td>
                <td><span class="badge">Cargado</span></td>
              </tr>

              <tr>
                <td>Tutorías</td>
                <td>{{ tutorias.length }}</td>
                <td><span class="badge">Cargado</span></td>
              </tr>

              <tr>
                <td>Avances</td>
                <td>{{ avances.length }}</td>
                <td><span class="badge">Cargado</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ALERTAS -->
      <div class="card">
        <h3>Alertas del sistema</h3>

        <div class="alerts-list">
          <div
            v-for="alerta in alertas"
            :key="alerta.titulo"
            class="alert-item"
          >
            <strong>{{ alerta.titulo }}</strong>
            <p>{{ alerta.descripcion }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ÚLTIMAS TUTORÍAS -->
    <div class="card">
      <div class="table-header">
        <div>
          <h3>Últimas tutorías registradas</h3>
          <p class="summary-text">
            Se muestran las últimas 10 tutorías cargadas en el sistema.
          </p>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Carrera</th>
              <th>Nivel</th>
              <th>Docente</th>
              <th>Fecha</th>
              <th>Modalidad</th>
              <th>Asistencia</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="tutoria in ultimasTutorias"
              :key="tutoria.id_tutoria"
            >
              <td>{{ obtenerNombreEstudiante(tutoria.id_estudiante) }}</td>
              <td>{{ obtenerCarreraEstudiante(tutoria.id_estudiante) }}</td>
              <td>{{ obtenerNivelEstudiante(tutoria.id_estudiante) }}</td>
              <td>{{ obtenerNombreDocente(tutoria.id_docente) }}</td>
              <td>{{ tutoria.fecha }}</td>
              <td>{{ tutoria.modalidad }}</td>
              <td>
                <span class="badge">
                  {{ tutoria.asistencia }}
                </span>
              </td>
            </tr>

            <tr v-if="ultimasTutorias.length === 0">
              <td colspan="7">
                No existen tutorías registradas.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { cargarCSV } from "../services/csvService";

const estudiantes = ref([]);
const docentes = ref([]);
const temas = ref([]);
const asignaciones = ref([]);
const tutorias = ref([]);
const avances = ref([]);

onMounted(() => {
  cargarDatos();
});

async function cargarDatos() {
  estudiantes.value = await obtenerDatos("estudiantes_vue", "/data/estudiantes.csv");
  docentes.value = await obtenerDatos("docentes_vue", "/data/docentes.csv");
  temas.value = await obtenerDatos("temas_vue", "/data/temas.csv");
  asignaciones.value = await obtenerDatos("asignaciones_vue", "/data/asignaciones.csv");
  tutorias.value = await obtenerDatos("tutorias_vue", "/data/tutorias.csv");
  avances.value = await obtenerDatos("avances_vue", "/data/avances.csv");
}

async function obtenerDatos(claveLocalStorage, rutaCSV) {
  const datosGuardados = localStorage.getItem(claveLocalStorage);

  if (datosGuardados) {
    return JSON.parse(datosGuardados);
  }

  const datos = await cargarCSV(rutaCSV);

  localStorage.setItem(
    claveLocalStorage,
    JSON.stringify(datos)
  );

  return datos;
}

const totalConTema = computed(() => {
  return temas.value.length;
});

const totalSinTema = computed(() => {
  return estudiantes.value.filter((estudiante) => {
    return !temas.value.some((tema) => {
      return Number(tema.id_estudiante) === Number(estudiante.id_estudiante);
    });
  }).length;
});

const totalConTutor = computed(() => {
  return asignaciones.value.filter((asignacion) => {
    return asignacion.estado === "Asignado";
  }).length;
});

const totalAvancesPendientes = computed(() => {
  return avances.value.filter((avance) => {
    return avance.estado === "Pendiente" || avance.estado === "Observado";
  }).length;
});

const totalInasistencias = computed(() => {
  return tutorias.value.filter((tutoria) => {
    return tutoria.asistencia === "No asistió";
  }).length;
});

const ultimasTutorias = computed(() => {
  return [...tutorias.value]
    .sort((a, b) => {
      return new Date(b.fecha) - new Date(a.fecha);
    })
    .slice(0, 10);
});

const alertas = computed(() => {
  return [
    {
      titulo: "Estudiantes sin tema",
      descripcion: `${totalSinTema.value} estudiantes todavía no tienen tema registrado.`
    },
    {
      titulo: "Avances pendientes",
      descripcion: `${totalAvancesPendientes.value} avances están pendientes u observados.`
    },
    {
      titulo: "Inasistencias",
      descripcion: `${totalInasistencias.value} tutorías registran inasistencia del estudiante.`
    },
    {
      titulo: "Control académico",
      descripcion: "El sistema mantiene información cargada desde CSV y LocalStorage."
    }
  ];
});

function obtenerEstudiante(id) {
  return estudiantes.value.find((item) => {
    return Number(item.id_estudiante) === Number(id);
  });
}

function obtenerDocente(id) {
  return docentes.value.find((item) => {
    return Number(item.id_docente) === Number(id);
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

function obtenerNombreDocente(id) {
  const docente = obtenerDocente(id);

  if (!docente) {
    return "Docente no encontrado";
  }

  return docente.nombres;
}
</script>