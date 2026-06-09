// =======================================================
// TALLER 4 - FORMATOS SEMIESTRUCTURADOS: JSON Y XML
// Aplicación: Gestor de Tareas Académicas
// Descripción: Permite crear, listar, eliminar, guardar y exportar tareas.
// =======================================================

// 1. Referencias al Modelo de Objetos del Documento (DOM)
const formularioTareas = document.getElementById('formulario-tareas');
const tituloTarea = document.getElementById('titulo-tarea');
const descripcionTarea = document.getElementById('descripcion-tarea');
const listaTareas = document.getElementById('lista-tareas');
const mensajeVacio = document.getElementById('mensaje-vacio');
const btnExportarJson = document.getElementById('btn-exportar-json');
const btnExportarXml = document.getElementById('btn-exportar-xml');
const btnLimpiar = document.getElementById('btn-limpiar');

// Clave única usada para guardar la información en LocalStorage.
const CLAVE_ALMACENAMIENTO = 'tareasGuardadas';

// 2. Estado de la aplicación.
// Si existen tareas guardadas, se recuperan; si no, inicia con un arreglo vacío.
let coleccionTareas = JSON.parse(localStorage.getItem(CLAVE_ALMACENAMIENTO)) || [];

// 3. Función para redibujar la lista de tareas en pantalla.
function redibujarInterfaz() {
  listaTareas.innerHTML = '';
  mensajeVacio.style.display = coleccionTareas.length === 0 ? 'block' : 'none';

  coleccionTareas.forEach((tarea, indice) => {
    const elementoLista = document.createElement('li');
    elementoLista.className = 'elemento-tarea';

    elementoLista.innerHTML = `
      <div>
        <h3>${escaparHtml(tarea.titulo)}</h3>
        <p>${escaparHtml(tarea.descripcion)}</p>
        <small>Código: ${tarea.codigo} | Registro: ${tarea.fecha}</small>
      </div>
      <button class="btn-eliminar" onclick="removerTarea(${indice})">Eliminar</button>
    `;

    listaTareas.appendChild(elementoLista);
  });
}

// 4. Función para actualizar LocalStorage.
// Los objetos JavaScript se convierten a texto JSON con JSON.stringify().
function actualizarAlmacenamientoLocal() {
  localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(coleccionTareas));
}

// 5. Evento para capturar el envío del formulario.
formularioTareas.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const titulo = tituloTarea.value.trim();
  const descripcion = descripcionTarea.value.trim();

  if (!titulo || !descripcion) {
    alert('Por favor, completa el título y la descripción de la tarea.');
    return;
  }

  // Estructura de datos de una tarea académica.
  const nuevaTarea = {
    codigo: Date.now().toString(),
    titulo,
    descripcion,
    fecha: new Date().toLocaleDateString('es-EC')
  };

  coleccionTareas.push(nuevaTarea);
  actualizarAlmacenamientoLocal();
  redibujarInterfaz();
  formularioTareas.reset();
  tituloTarea.focus();
});

// 6. Función global para eliminar una tarea por su índice.
window.removerTarea = function(indice) {
  const confirmar = confirm('¿Deseas eliminar esta tarea?');

  if (!confirmar) return;

  coleccionTareas.splice(indice, 1);
  actualizarAlmacenamientoLocal();
  redibujarInterfaz();
};

// 7. Exportación nativa a formato JSON.
btnExportarJson.addEventListener('click', () => {
  if (coleccionTareas.length === 0) {
    alert('No existen tareas para exportar.');
    return;
  }

  const textoJson = JSON.stringify(coleccionTareas, null, 2);

  console.log('--- FLUJO DE DATOS: JSON GENERADO ---');
  console.log(textoJson);

  generarDescarga(textoJson, 'tareas_academicas.json', 'application/json');
});

// 8. Exportación a formato XML mediante etiquetas personalizadas.
btnExportarXml.addEventListener('click', () => {
  if (coleccionTareas.length === 0) {
    alert('No existen tareas para exportar.');
    return;
  }

  let textoXml = '<?xml version="1.0" encoding="UTF-8"?>\n<tareas>\n';

  coleccionTareas.forEach((tarea) => {
    textoXml += `  <tarea codigo="${sanitizarTextoXml(tarea.codigo)}">\n`;
    textoXml += `    <titulo>${sanitizarTextoXml(tarea.titulo)}</titulo>\n`;
    textoXml += `    <descripcion>${sanitizarTextoXml(tarea.descripcion)}</descripcion>\n`;
    textoXml += `    <fecha>${sanitizarTextoXml(tarea.fecha)}</fecha>\n`;
    textoXml += '  </tarea>\n';
  });

  textoXml += '</tareas>';

  console.log('--- FLUJO DE DATOS: XML GENERADO ---');
  console.log(textoXml);

  generarDescarga(textoXml, 'tareas_academicas.xml', 'application/xml');
});

// 9. Botón para limpiar todas las tareas del navegador.
btnLimpiar.addEventListener('click', () => {
  if (coleccionTareas.length === 0) {
    alert('No hay tareas para limpiar.');
    return;
  }

  const confirmar = confirm('¿Seguro que deseas borrar todas las tareas guardadas?');

  if (!confirmar) return;

  coleccionTareas = [];
  actualizarAlmacenamientoLocal();
  redibujarInterfaz();
});

// 10. Función utilitaria para descargar archivos desde el navegador.
function generarDescarga(contenidoTexto, nombreArchivo, tipoMime) {
  const bloqueDatos = new Blob([contenidoTexto], { type: tipoMime });
  const urlDescarga = URL.createObjectURL(bloqueDatos);
  const enlaceDescarga = document.createElement('a');

  enlaceDescarga.href = urlDescarga;
  enlaceDescarga.download = nombreArchivo;
  enlaceDescarga.click();

  URL.revokeObjectURL(urlDescarga);
}

// 11. Sanitización para evitar errores al generar XML.
function sanitizarTextoXml(textoInseguro) {
  return String(textoInseguro).replace(/[<>&'"]/g, (caracter) => {
    switch (caracter) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return caracter;
    }
  });
}

// 12. Escape básico para evitar insertar HTML no deseado en la interfaz.
function escaparHtml(texto) {
  const elementoTemporal = document.createElement('div');
  elementoTemporal.textContent = texto;
  return elementoTemporal.innerHTML;
}

// 13. Renderizado inicial al cargar la página.
redibujarInterfaz();
