/* =========================================================
   INTEGRACIÓN PROGRESIVA CON VUE 3
   Proyecto: Sistema de Registro y Control de Trabajos de Titulación
   ========================================================= */

/*
  Se implementó Vue de manera progresiva para mantener toda la
  funcionalidad original del sistema.

  Vue controla:
  - Menú superior.
  - Selector de carrera.
  - Selector de nivel según la duración de la carrera.
  - Panel informativo del framework usado.

  La lógica CRUD original se mantiene en app.js.
*/

document.addEventListener("DOMContentLoaded", () => {
  if (!window.Vue) {
    console.warn("Vue no se cargó. Revise la conexión o el CDN de Vue.");
    return;
  }

  const { createApp } = Vue;

  /* =======================================================
     COMPONENTE VUE: MENÚ PRINCIPAL
     ======================================================= */

  const menuRoot = document.getElementById("vueMenu");

  if (menuRoot) {
    createApp({
      data() {
        return {
          seccionActiva: "dashboard",
          opciones: [
            { id: "dashboard", texto: "Inicio" },
            { id: "estudiantes", texto: "Estudiantes" },
            { id: "docentes", texto: "Docentes" },
            { id: "temas", texto: "Temas" },
            { id: "asignaciones", texto: "Asignación Tutor" },
            { id: "tutorias", texto: "Tutorías" },
            { id: "avances", texto: "Avances" },
            { id: "reportes", texto: "Reportes" },
            { id: "csv", texto: "CSV" }
          ]
        };
      },

      methods: {
        cambiarSeccion(id) {
          this.seccionActiva = id;

          if (typeof mostrarSeccion === "function") {
            mostrarSeccion(id);
          }
        }
      },

      template: `
        <button
          v-for="opcion in opciones"
          :key="opcion.id"
          class="menu-btn"
          :class="{ active: seccionActiva === opcion.id }"
          type="button"
          @click="cambiarSeccion(opcion.id)"
        >
          {{ opcion.texto }}
        </button>
      `
    }).mount("#vueMenu");
  }

  /* =======================================================
     COMPONENTE VUE: CARRERA Y NIVEL DEL ESTUDIANTE
     ======================================================= */

  const carreraNivelRoot = document.getElementById("vueCarreraNivel");

  if (carreraNivelRoot) {
    createApp({
      data() {
        return {
          carreraSeleccionada: "",
          nivelSeleccionado: "",
          carreras: window.ULEAM_CARRERAS || []
        };
      },

      computed: {
        nivelesDisponibles() {
          if (!this.carreraSeleccionada) {
            return [];
          }

          return window.obtenerNivelesULEAM(this.carreraSeleccionada);
        }
      },

      methods: {
        cambiarCarrera() {
          const niveles = this.nivelesDisponibles;

          if (!niveles.includes(this.nivelSeleccionado)) {
            this.nivelSeleccionado = "";
          }
        },

        sincronizarDesdeDOM() {
          const selectCarrera = document.getElementById("carrera");
          const selectNivel = document.getElementById("nivel");

          if (selectCarrera) {
            this.carreraSeleccionada = selectCarrera.value;
          }

          this.$nextTick(() => {
            if (selectNivel) {
              this.nivelSeleccionado = selectNivel.value;
            }
          });
        }
      },

      mounted() {
        /*
          Se expone esta función para que app.js pueda actualizar los niveles
          cuando se edita un estudiante.
        */
        window.vueCarreraNivel = this;
      },

      template: `
        <div class="field">
          <label>Carrera *</label>

          <select
            id="carrera"
            required
            v-model="carreraSeleccionada"
            @change="cambiarCarrera"
          >
            <option value="">Seleccione</option>

            <option
              v-for="carrera in carreras"
              :key="carrera"
              :value="carrera"
            >
              {{ carrera }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>Nivel *</label>

          <select
            id="nivel"
            required
            v-model="nivelSeleccionado"
          >
            <option value="">
              {{ carreraSeleccionada ? "Seleccione el nivel" : "Primero seleccione una carrera" }}
            </option>

            <option
              v-for="nivel in nivelesDisponibles"
              :key="nivel"
              :value="nivel"
            >
              {{ nivel }}
            </option>
          </select>

          <small class="vue-help" v-if="carreraSeleccionada">
            Vue muestra automáticamente los niveles válidos para esta carrera.
          </small>
        </div>
      `
    }).mount("#vueCarreraNivel");
  }

  /* =======================================================
     COMPONENTE VUE: INDICADOR DEL FRAMEWORK
     ======================================================= */

  const frameworkRoot = document.getElementById("vueFrameworkBadge");

  if (frameworkRoot) {
    createApp({
      data() {
        return {
          framework: "Vue 3",
          tipo: "Implementación progresiva",
          descripcion: "El sistema conserva su lógica original y usa Vue para componentes de interfaz."
        };
      },

      template: `
        <div class="framework-card">
          <strong>{{ framework }}</strong>
          <span>{{ tipo }}</span>
          <p>{{ descripcion }}</p>
        </div>
      `
    }).mount("#vueFrameworkBadge");
  }
});
