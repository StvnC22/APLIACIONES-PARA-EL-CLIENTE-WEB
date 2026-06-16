<template>
  <Login
    v-if="!sesionActiva"
    @login="iniciarSesion"
  />

  <main
    v-else
    class="app"
  >
    <header class="topbar">
      <div class="brand">
        <div class="brand-logo">
          <img src="/img/logo.png" alt="Logo" />
        </div>

        <div>
          <h1>Sistema de Titulación</h1>
          <p>Registro y control de trabajos de titulación</p>
        </div>
      </div>

      <nav class="menu">
        <button
          v-for="item in menu"
          :key="item.id"
          class="menu-btn"
          :class="{ active: seccionActiva === item.id }"
          type="button"
          @click="seccionActiva = item.id"
        >
          {{ item.texto }}
        </button>
      </nav>

      <div class="user-box">
        <button
          class="btn neutral"
          type="button"
          @click="alternarModoOscuro"
        >
          {{ modoOscuro ? "☀️ Modo claro" : "🌙 Modo oscuro" }}
        </button>

        <span class="avatar">A</span>
        <span>Administrador</span>

        <button
          class="btn warning small"
          type="button"
          @click="cerrarSesion"
        >
          Salir
        </button>
      </div>
    </header>

    <Dashboard v-if="seccionActiva === 'dashboard'" />
    <Estudiantes v-else-if="seccionActiva === 'estudiantes'" />
    <Docentes v-else-if="seccionActiva === 'docentes'" />
    <Temas v-else-if="seccionActiva === 'temas'" />
    <Asignaciones v-else-if="seccionActiva === 'asignaciones'" />
    <Tutorias v-else-if="seccionActiva === 'tutorias'" />
    <Avances v-else-if="seccionActiva === 'avances'" />
    <Reportes v-else-if="seccionActiva === 'reportes'" />
    <CsvPanel v-else-if="seccionActiva === 'csv'" />
  </main>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";

import Login from "./components/Login.vue";
import Dashboard from "./components/Dashboard.vue";
import Estudiantes from "./components/Estudiantes.vue";
import Docentes from "./components/Docentes.vue";
import Temas from "./components/Temas.vue";
import Asignaciones from "./components/Asignaciones.vue";
import Tutorias from "./components/Tutorias.vue";
import Avances from "./components/Avances.vue";
import Reportes from "./components/Reportes.vue";
import CsvPanel from "./components/CsvPanel.vue";

const sesionActiva = ref(localStorage.getItem("sesionActiva") === "true");
const seccionActiva = ref("dashboard");
const modoOscuro = ref(localStorage.getItem("modoOscuro") === "activo");

const menu = [
  { id: "dashboard", texto: "Inicio" },
  { id: "estudiantes", texto: "Estudiantes" },
  { id: "docentes", texto: "Docentes" },
  { id: "temas", texto: "Temas" },
  { id: "asignaciones", texto: "Asignación Tutor" },
  { id: "tutorias", texto: "Tutorías" },
  { id: "avances", texto: "Avances" },
  { id: "reportes", texto: "Reportes" },
  { id: "csv", texto: "CSV" }
];

function iniciarSesion() {
  sesionActiva.value = true;
  localStorage.setItem("sesionActiva", "true");
}

function cerrarSesion() {
  sesionActiva.value = false;
  localStorage.removeItem("sesionActiva");
  seccionActiva.value = "dashboard";
}

function alternarModoOscuro() {
  modoOscuro.value = !modoOscuro.value;
}

function aplicarModoOscuro() {
  if (modoOscuro.value) {
    document.body.classList.add("dark-mode");
    localStorage.setItem("modoOscuro", "activo");
  } else {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("modoOscuro", "inactivo");
  }
}

watch(modoOscuro, aplicarModoOscuro);

onMounted(() => {
  aplicarModoOscuro();
});
</script>