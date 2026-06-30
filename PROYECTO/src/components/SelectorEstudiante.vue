<template>
  <div class="field full-field">
    <label>{{ label }}</label>

    <div class="student-search-box">
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
          placeholder="Buscar por cédula, nombre, apellido, carrera, nivel o correo"
        />
      </div>

      <select v-model="idSeleccionado" required>
        <option value="">Seleccione estudiante</option>
        <option
          v-for="estudiante in estudiantesFiltrados"
          :key="estudiante.id_estudiante"
          :value="estudiante.id_estudiante"
        >
          {{ estudiante.cedula }} - {{ estudiante.nombres }} {{ estudiante.apellidos }} -
          {{ obtenerFacultadEstudiante(estudiante) }} - {{ estudiante.carrera }} - {{ estudiante.nivel }}
        </option>
      </select>

      <small class="vue-help">
        Estudiantes encontrados: {{ estudiantesFiltrados.length }}
      </small>
    </div>

    <div v-if="estudianteSeleccionado" class="student-selected">
      <strong>Estudiante seleccionado:</strong>
      <span>{{ estudianteSeleccionado.nombres }} {{ estudianteSeleccionado.apellidos }}</span>
      <p>
        Cédula: {{ estudianteSeleccionado.cedula }} |
        Facultad: {{ obtenerFacultadEstudiante(estudianteSeleccionado) }} |
        Carrera: {{ estudianteSeleccionado.carrera }} |
        Nivel: {{ estudianteSeleccionado.nivel }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { facultades, facultadesPorCarrera } from "../data/facultades.js";

const props = defineProps({
  modelValue: { type: [String, Number], default: "" },
  estudiantes: { type: Array, default: () => [] },
  label: { type: String, default: "Buscar estudiante *" }
});

const emit = defineEmits(["update:modelValue"]);
const busqueda = ref("");
const filtroFacultad = ref("");

const idSeleccionado = computed({
  get: () => props.modelValue,
  set: (valor) => emit("update:modelValue", valor)
});

const estudiantesFiltrados = computed(() => {
  const texto = limpiarTexto(busqueda.value);

  return props.estudiantes.filter((estudiante) => {
    const facultad = obtenerFacultadEstudiante(estudiante);
    const coincideFacultad = !filtroFacultad.value || facultad === filtroFacultad.value;
    const textoCompleto = limpiarTexto(`
      ${estudiante.cedula} ${estudiante.nombres} ${estudiante.apellidos}
      ${estudiante.correo} ${estudiante.carrera} ${estudiante.nivel} ${facultad}
    `);

    return coincideFacultad && textoCompleto.includes(texto);
  });
});

const estudianteSeleccionado = computed(() => {
  return props.estudiantes.find((estudiante) => {
    return Number(estudiante.id_estudiante) === Number(props.modelValue);
  });
});

function obtenerFacultadEstudiante(estudiante) {
  if (estudiante.facultad && estudiante.facultad.trim() !== "") return estudiante.facultad;
  return facultadesPorCarrera[estudiante.carrera] || "Sin facultad";
}

function limpiarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
</script>
