<template>
  <section class="page">
    <div class="page-title">
      <div>
        <h2>Reportes</h2>
        <p>Consulta de información académica del proceso de titulación.</p>
      </div>
    </div>

    <div class="reports-grid">
      <button
        class="report-card"
        type="button"
        @click="generarReporte('sinTema')"
      >
        <strong>Estudiantes sin tema</strong>
        <span>Ver estudiantes que aún no tienen tema registrado.</span>
      </button>

      <button
        class="report-card"
        type="button"
        @click="generarReporte('sinTutor')"
      >
        <strong>Estudiantes sin tutor</strong>
        <span>Ver estudiantes que aún no tienen docente tutor asignado.</span>
      </button>

      <button
        class="report-card"
        type="button"
        @click="generarReporte('avancesPendientes')"
      >
        <strong>Avances pendientes</strong>
        <span>Ver avances pendientes u observados.</span>
      </button>

      <button
        class="report-card"
        type="button"
        @click="generarReporte('inasistencias')"
      >
        <strong>Inasistencias</strong>
        <span>Ver tutorías con estudiantes que no asistieron.</span>
      </button>
    </div>

    <div class="card">
      <div class="table-header">
        <div>
          <h3>{{ tituloReporte }}</h3>
          <p class="summary-text">
            Total de registros: {{ reporte.length }}
          </p>
        </div>

        <button
          class="btn success"
          type="button"
          @click="exportarReporte"
        >
          Exportar reporte CSV
        </button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th
                v-for="columna in columnas"
                :key="columna"
              >
                {{ columna }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(fila, index) in reporte"
              :key="index"
            >
              <td
                v-for="columna in columnas"
                :key="columna"
              >
                {{ fila[columna] }}
              </td>
            </tr>

            <tr v-if="reporte.length === 0">
              <td :colspan="columnas.length || 1">
                Seleccione un reporte para visualizar la información.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { cargarCSV, descargarCSV } from "../services/csvService";

const estudiantes = ref([]);
const docentes = ref([]);
const temas = ref([]);
const asignaciones = ref([]);
const tutorias = ref([]);
const avances = ref([]);

const reporte = ref([]);
const columnas = ref(["Mensaje"]);
const tituloReporte = ref("Reporte generado");

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

function generarReporte(tipo) {
  if (tipo === "sinTema") {
    generarEstudiantesSinTema();
  }

  if (tipo === "sinTutor") {
    generarEstudiantesSinTutor();
  }

  if (tipo === "avancesPendientes") {
    generarAvancesPendientes();
  }

  if (tipo === "inasistencias") {
    generarInasistencias();
  }
}

function generarEstudiantesSinTema() {
  tituloReporte.value = "Estudiantes sin tema registrado";

  columnas.value = [
    "Cédula",
    "Estudiante",
    "Carrera",
    "Nivel",
    "Correo",
    "Estado"
  ];

  reporte.value = estudiantes.value
    .filter((estudiante) => {
      return !temas.value.some((tema) => {
        return Number(tema.id_estudiante) === Number(estudiante.id_estudiante);
      });
    })
    .map((estudiante) => {
      return {
        "Cédula": estudiante.cedula,
        "Estudiante": `${estudiante.nombres} ${estudiante.apellidos}`,
        "Carrera": estudiante.carrera,
        "Nivel": estudiante.nivel,
        "Correo": estudiante.correo,
        "Estado": estudiante.estado
      };
    });
}

function generarEstudiantesSinTutor() {
  tituloReporte.value = "Estudiantes sin tutor asignado";

  columnas.value = [
    "Cédula",
    "Estudiante",
    "Carrera",
    "Nivel",
    "Correo",
    "Estado"
  ];

  reporte.value = estudiantes.value
    .filter((estudiante) => {
      return !asignaciones.value.some((asignacion) => {
        return (
          Number(asignacion.id_estudiante) === Number(estudiante.id_estudiante) &&
          asignacion.estado === "Asignado"
        );
      });
    })
    .map((estudiante) => {
      return {
        "Cédula": estudiante.cedula,
        "Estudiante": `${estudiante.nombres} ${estudiante.apellidos}`,
        "Carrera": estudiante.carrera,
        "Nivel": estudiante.nivel,
        "Correo": estudiante.correo,
        "Estado": estudiante.estado
      };
    });
}

function generarAvancesPendientes() {
  tituloReporte.value = "Avances pendientes u observados";

  columnas.value = [
    "Estudiante",
    "Carrera",
    "Nivel",
    "Avance",
    "Documento",
    "Fecha de entrega",
    "Estado",
    "Comentario"
  ];

  reporte.value = avances.value
    .filter((avance) => {
      return avance.estado === "Pendiente" || avance.estado === "Observado";
    })
    .map((avance) => {
      const estudiante = obtenerEstudiante(avance.id_estudiante);

      return {
        "Estudiante": estudiante
          ? `${estudiante.nombres} ${estudiante.apellidos}`
          : "Estudiante no encontrado",
        "Carrera": estudiante ? estudiante.carrera : "Sin carrera",
        "Nivel": estudiante ? estudiante.nivel : "Sin nivel",
        "Avance": `Avance ${avance.numero_avance}`,
        "Documento": avance.tipo_documento,
        "Fecha de entrega": avance.fecha_entrega,
        "Estado": avance.estado,
        "Comentario": avance.comentario_tutor
      };
    });
}

function generarInasistencias() {
  tituloReporte.value = "Inasistencias a tutorías";

  columnas.value = [
    "Estudiante",
    "Carrera",
    "Nivel",
    "Docente",
    "Fecha",
    "Modalidad",
    "Asistencia",
    "Tema tratado"
  ];

  reporte.value = tutorias.value
    .filter((tutoria) => {
      return tutoria.asistencia === "No asistió";
    })
    .map((tutoria) => {
      const estudiante = obtenerEstudiante(tutoria.id_estudiante);
      const docente = obtenerDocente(tutoria.id_docente);

      return {
        "Estudiante": estudiante
          ? `${estudiante.nombres} ${estudiante.apellidos}`
          : "Estudiante no encontrado",
        "Carrera": estudiante ? estudiante.carrera : "Sin carrera",
        "Nivel": estudiante ? estudiante.nivel : "Sin nivel",
        "Docente": docente ? docente.nombres : "Docente no encontrado",
        "Fecha": tutoria.fecha,
        "Modalidad": tutoria.modalidad,
        "Asistencia": tutoria.asistencia,
        "Tema tratado": tutoria.tema_tratado
      };
    });
}

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

function exportarReporte() {
  if (reporte.value.length === 0) {
    alert("Primero debe generar un reporte.");
    return;
  }

  const nombreArchivo = tituloReporte.value
    .toLowerCase()
    .replaceAll(" ", "_")
    .replaceAll("á", "a")
    .replaceAll("é", "e")
    .replaceAll("í", "i")
    .replaceAll("ó", "o")
    .replaceAll("ú", "u")
    .replaceAll("ñ", "n");

  descargarCSV(`${nombreArchivo}.csv`, reporte.value);
}
</script>