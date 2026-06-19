const $=id=>document.getElementById(id);
let estudiantes=JSON.parse(localStorage.getItem("estudiantes"))||[];

const campos=["cedula","apellidos","nombres","direccion","telefono","correo","facultad","nivel","paralelo"];
const regex={
  cedula:/^\d{10}$/,
  apellidos:/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/,
  nombres:/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/,
  direccion:/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s.,#-]{5,}$/,
  telefono:/^09\d{8}$/,
  correo:/^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/
};

function guardar(){
  localStorage.setItem("estudiantes",JSON.stringify(estudiantes));
}

function limpiarErrores(){
  campos.forEach(c=>$("e"+c[0].toUpperCase()+c.slice(1)).textContent="");
}

function validar(){
  limpiarErrores();
  let ok=true;

  campos.forEach(c=>{
    let v=$(c).value.trim(), error=$("e"+c[0].toUpperCase()+c.slice(1));
    if(regex[c]&&!regex[c].test(v)){error.textContent="Dato inválido";ok=false}
    if(!regex[c]&&!v){error.textContent="Seleccione una opción";ok=false}
  });

  if(estudiantes.some(e=>e.cedula==$("cedula").value.trim())){
    $("eCedula").textContent="Cédula ya registrada";ok=false;
  }

  return ok;
}

function mostrar(){
  $("tabla").innerHTML=estudiantes.length?estudiantes.map((e,i)=>`
    <tr>
      <td>${e.cedula}</td><td>${e.apellidos}</td><td>${e.nombres}</td>
      <td>${e.telefono}</td><td>${e.correo}</td><td>${e.facultad}</td>
      <td>${e.nivel}</td><td>${e.paralelo}</td>
      <td><button class="eliminar" onclick="eliminar(${i})">Eliminar</button></td>
    </tr>`).join(""):`<tr><td colspan="9">No existen estudiantes registrados</td></tr>`;
}

$("form").addEventListener("submit",e=>{
  e.preventDefault();
  if(!validar())return;

  let estudiante={};
  campos.forEach(c=>estudiante[c]=$(c).value.trim());
  estudiantes.push(estudiante);
  guardar();
  mostrar();
  $("form").reset();
  alert("Estudiante registrado correctamente");
});

function eliminar(i){
  if(confirm("¿Eliminar estudiante?")){
    estudiantes.splice(i,1);
    guardar();
    mostrar();
  }
}

mostrar();