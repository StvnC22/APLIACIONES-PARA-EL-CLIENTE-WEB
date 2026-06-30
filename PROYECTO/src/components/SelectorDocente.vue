<template>
  <div class="field full-field">
    <label>{{ label }}</label>

    <div class="teacher-search-box">
      <div class="filter-row">
        <select v-model="filtroFacultad">
          <option value="">Todas las facultades</option>
          <option v-for="facultad in facultades" :key="facultad" :value="facultad">
            {{ facultad }}
          </option>
        </select>

        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por cédula, nombre, correo, facultad o especialidad"
        />
      </div>

      <select v-model="idSeleccionado" required>
        <option value="">Seleccione docente tutor</option>
        <option
          v-for="docente in docentesFiltrados"
          :key="docente.id_docente"
          :value="docente.id_docente"
        >
          {{ docente.cedula }} - {{ docente.nombres }} - {{ obtenerFacultadDocente(docente) }} -
          {{ docente.especialidad }}
        </option>
      </select>

      <small class="vue-help">
        Docentes encontrados: {{ docentesFiltrados.length }}
      </small>
    </div>

    <div v-if="docenteSeleccionado" class="teacher-selected">
      <strong>Docente seleccionado:</strong>
      <span>{{ docenteSeleccionado.nombres }}</span>
      <p>
        Cédula: {{ docenteSeleccionado.cedula }} |
        Facultad: {{ obtenerFacultadDocente(docenteSeleccionado) }} |
        Especialidad: {{ docenteSeleccionado.especialidad }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { facultades } from "../data/facultades.js";

const props = defineProps({
  modelValue: { type: [String, Number], default: "" },
  docentes: { type: Array, default: () => [] },
  label: { type: String, default: "Buscar docente tutor *" }
});

const emit = defineEmits(["update:modelValue"]);
const busqueda = ref("");
const filtroFacultad = ref("");

const idSeleccionado = computed({
  get: () => props.modelValue,
  set: (valor) => emit("update:modelValue", valor)
});

const docentesFiltrados = computed(() => {
  const texto = limpiarTexto(busqueda.value);

  return props.docentes
    .filter((docente) => docente.estado === "Activo")
    .filter((docente) => {
      const facultad = obtenerFacultadDocente(docente);
      const coincideFacultad = !filtroFacultad.value || facultad === filtroFacultad.value;
      const textoCompleto = limpiarTexto(`
        ${docente.cedula} ${docente.nombres} ${docente.correo}
        ${docente.facultad} ${docente.especialidad} ${docente.estado}
      `);

      return coincideFacultad && textoCompleto.includes(texto);
    });
});

const docenteSeleccionado = computed(() => {
  return props.docentes.find((docente) => {
    return Number(docente.id_docente) === Number(props.modelValue);
  });
});

function obtenerFacultadDocente(docente) {
  if (docente.facultad && docente.facultad.trim() !== "") return docente.facultad;
  return "Sin facultad";
}

function limpiarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
</script>
