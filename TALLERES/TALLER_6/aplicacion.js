let libros = JSON.parse(localStorage.getItem("listaLibros")) || [];
let editando = false;

const formulario = document.getElementById("formulario");
const titulo = document.getElementById("titulo");
const autor = document.getElementById("autor");
const idLibro = document.getElementById("idLibro");
const tablaLibros = document.getElementById("tablaLibros");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");

function guardarLocalStorage() {
  localStorage.setItem("listaLibros", JSON.stringify(libros));
}

function mostrarLibros() {
  tablaLibros.innerHTML = "";

  if (libros.length === 0) {
    tablaLibros.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center;">No hay libros registrados.</td>
      </tr>
    `;
    return;
  }

  libros.forEach(libro => {
    tablaLibros.innerHTML += `
      <tr>
        <td>${libro.titulo}</td>
        <td>${libro.autor}</td>
        <td>
          <button class="btn-editar" onclick="editarLibro('${libro.id}')">Editar</button>
          <button class="btn-eliminar" onclick="eliminarLibro('${libro.id}')">Eliminar</button>
        </td>
      </tr>
    `;
  });

  guardarLocalStorage();
}

formulario.addEventListener("submit", function(evento) {
  evento.preventDefault();

  const datosLibro = {
    id: editando ? idLibro.value : crypto.randomUUID(),
    titulo: titulo.value.trim(),
    autor: autor.value.trim()
  };

  if (editando) {
    libros = libros.map(libro => libro.id === datosLibro.id ? datosLibro : libro);
  } else {
    libros.push(datosLibro);
  }

  reiniciarFormulario();
  mostrarLibros();
});

function editarLibro(id) {
  const libro = libros.find(libro => libro.id === id);

  if (!libro) return;

  idLibro.value = libro.id;
  titulo.value = libro.titulo;
  autor.value = libro.autor;

  editando = true;
  btnGuardar.textContent = "Actualizar Libro";
  btnCancelar.classList.remove("oculto");
}

function eliminarLibro(id) {
  if (confirm("¿Está seguro de eliminar este libro?")) {
    libros = libros.filter(libro => libro.id !== id);
    reiniciarFormulario();
    mostrarLibros();
  }
}

function reiniciarFormulario() {
  formulario.reset();
  idLibro.value = "";
  editando = false;
  btnGuardar.textContent = "Guardar Libro";
  btnCancelar.classList.add("oculto");
}

btnCancelar.addEventListener("click", reiniciarFormulario);

mostrarLibros();