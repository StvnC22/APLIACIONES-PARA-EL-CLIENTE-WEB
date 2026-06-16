<template>
  <section class="page">
    <div class="page-title">
      <div>
        <h2>Gestión CSV</h2>
        <p>Importación, exportación y recarga de datos del sistema.</p>
      </div>
    </div>

    <div class="card">
      <h3>Exportar información</h3>

      <p class="summary-text">
        Desde aquí puedes descargar los datos actuales guardados en el sistema.
      </p>

      <div class="csv-grid">
        <button
          class="btn success"
          type="button"
          @click="exportarDatos('estudiantes')"
        >
          Exportar estudiantes
        </button>

        <button
          class="btn success"
          type="button"
          @click="exportarDatos('docentes')"
        >
          Exportar docentes
        </button>

        <button
          class="btn success"
          type="button"
          @click="exportarDatos('temas')"
        >
          Exportar temas
        </button>

        <button
          class="btn success"
          type="button"
          @click="exportarDatos('asignaciones')"
        >
          Exportar asignaciones
        </button>

        <button
          class="btn success"
          type="button"
          @click="exportarDatos('tutorias')"
        >
          Exportar tutorías
        </button>

        <button
          class="btn success"
          type="button"
          @click="exportarDatos('avances')"
        >
          Exportar avances
        </button>
      </div>
    </div>

    <div class="card">
      <h3>Recargar CSV iniciales</h3>

      <p class="summary-text">
        Esta opción borra los datos guardados en el navegador y vuelve a cargar
        los archivos CSV originales ubicados en <strong>public/data</strong>.
      </p>

      <button
        class="btn primary"
        type="button"
        @click="recargarCSVInicial"
      >
        Recargar CSV inicial
      </button>
    </div>

    <div class="card danger-zone">
      <h3>Limpiar datos del navegador</h3>

      <p class="summary-text">
        Esta opción elimina los datos guardados en LocalStorage. Después puedes
        volver a cargar los CSV iniciales.
      </p>

      <button
        class="btn danger"
        type="button"
        @click="limpiarLocalStorage"
      >
        Limpiar LocalStorage
      </button>
    </div>

    <div class="card">
      <h3>Estado de datos cargados</h3>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Módulo</th>
              <th>Registros</th>
              <th>Fuente actual</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in resumen"
              :key="item.modulo"
            >
              <td>{{ item.modulo }}</td>
              <td>{{ item.total }}</td>
              <td>{{ item.fuente }}</td>
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

const resumen = ref([]);

const configuracion = {
  estudiantes: {
    nombre: "Estudiantes",
    clave: "estudiantes_vue",
    ruta: "/data/estudiantes.csv",
    archivo: "estudiantes.csv"
  },
  docentes: {
    nombre: "Docentes",
    clave: "docentes_vue",
    ruta: "/data/docentes.csv",
    archivo: "docentes.csv"
  },
  temas: {
    nombre: "Temas",
    clave: "temas_vue",
    ruta: "/data/temas.csv",
    archivo: "temas.csv"
  },
  asignaciones: {
    nombre: "Asignaciones",
    clave: "asignaciones_vue",
    ruta: "/data/asignaciones.csv",
    archivo: "asignaciones.csv"
  },
  tutorias: {
    nombre: "Tutorías",
    clave: "tutorias_vue",
    ruta: "/data/tutorias.csv",
    archivo: "tutorias.csv"
  },
  avances: {
    nombre: "Avances",
    clave: "avances_vue",
    ruta: "/data/avances.csv",
    archivo: "avances.csv"
  }
};

onMounted(() => {
  actualizarResumen();
});

async function obtenerDatos(tipo) {
  const config = configuracion[tipo];
  const datosGuardados = localStorage.getItem(config.clave);

  if (datosGuardados) {
    return JSON.parse(datosGuardados);
  }

  const datosCSV = await cargarCSV(config.ruta);

  localStorage.setItem(
    config.clave,
    JSON.stringify(datosCSV)
  );

  return datosCSV;
}

async function exportarDatos(tipo) {
  const config = configuracion[tipo];
  const datos = await obtenerDatos(tipo);

  if (!datos.length) {
    alert(`No hay datos para exportar en ${config.nombre}.`);
    return;
  }

  descargarCSV(config.archivo, datos);
}

async function recargarCSVInicial() {
  const confirmar = confirm(
    "¿Seguro que deseas recargar los CSV iniciales? Se reemplazarán los datos guardados."
  );

  if (!confirmar) {
    return;
  }

  for (const tipo in configuracion) {
    const config = configuracion[tipo];
    const datosCSV = await cargarCSV(config.ruta);

    localStorage.setItem(
      config.clave,
      JSON.stringify(datosCSV)
    );
  }

  actualizarResumen();

  alert("CSV iniciales recargados correctamente.");
}

function limpiarLocalStorage() {
  const confirmar = confirm(
    "¿Seguro que deseas limpiar los datos guardados en el navegador?"
  );

  if (!confirmar) {
    return;
  }

  for (const tipo in configuracion) {
    const config = configuracion[tipo];
    localStorage.removeItem(config.clave);
  }

  actualizarResumen();

  alert("Datos del sistema eliminados del LocalStorage.");
}

function actualizarResumen() {
  resumen.value = Object.keys(configuracion).map((tipo) => {
    const config = configuracion[tipo];
    const datosGuardados = localStorage.getItem(config.clave);

    if (datosGuardados) {
      const datos = JSON.parse(datosGuardados);

      return {
        modulo: config.nombre,
        total: datos.length,
        fuente: "LocalStorage"
      };
    }

    return {
      modulo: config.nombre,
      total: 0,
      fuente: "Pendiente de cargar CSV"
    };
  });
}
</script>