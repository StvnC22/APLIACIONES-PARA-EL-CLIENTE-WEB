<template>
  <section class="login-screen">
    <div class="login-info">
      <div class="login-logo">
        <img src="/img/logo2.png" alt="Logo del sistema" />
      </div>

      <h1>Sistema de Registro y Control de Trabajos de Titulación</h1>

      <p>
        Plataforma académica para administrar estudiantes, docentes tutores,
        temas, tutorías, avances y reportes del proceso de titulación.
      </p>

      <div class="login-tags">
        <span>Estudiantes</span>
        <span>Tutores</span>
        <span>Avances</span>
        <span>Reportes</span>
      </div>
    </div>

    <form class="login-card" @submit.prevent="validarLogin">
      <h2>Inicio de sesión</h2>

      <p>Ingrese sus credenciales para acceder al sistema.</p>

      <div class="field">
        <label>Usuario</label>

        <input
          v-model="usuario"
          type="text"
          placeholder="Ingrese el usuario"
        />
      </div>

      <div class="field">
        <label>Contraseña</label>

        <input
          v-model="password"
          type="password"
          placeholder="Ingrese la contraseña"
        />
      </div>

      <button class="btn primary full" type="submit">
        Ingresar
      </button>

      <p v-if="error" class="error-text">
        Usuario o contraseña incorrectos.
      </p>

      <div class="demo-access">
        <strong>Acceso de prueba:</strong><br />
        Usuario: admin <br />
        Contraseña: 12345
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["login"]);

const usuario = ref("");
const password = ref("");
const error = ref(false);

function validarLogin() {
  if (usuario.value === "admin" && password.value === "12345") {
    error.value = false;
    emit("login");
    return;
  }

  error.value = true;
}
</script>