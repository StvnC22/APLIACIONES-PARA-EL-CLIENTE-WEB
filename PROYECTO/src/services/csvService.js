export async function cargarCSV(ruta) {
  const respuesta = await fetch(ruta);
  const texto = await respuesta.text();

  return convertirCSVEnObjetos(texto);
}

export function convertirCSVEnObjetos(texto) {
  const lineas = texto.trim().split("\n");
  const encabezados = separarLineaCSV(lineas[0]).map((item) => item.trim());

  return lineas.slice(1).map((linea) => {
    const valores = separarLineaCSV(linea);
    const objeto = {};

    encabezados.forEach((encabezado, index) => {
      objeto[encabezado] = valores[index] ? valores[index].trim() : "";
    });

    return objeto;
  });
}

function separarLineaCSV(linea) {
  const resultado = [];
  let valor = "";
  let dentroComillas = false;

  for (let i = 0; i < linea.length; i++) {
    const caracter = linea[i];

    if (caracter === '"') {
      dentroComillas = !dentroComillas;
    } else if (caracter === "," && !dentroComillas) {
      resultado.push(valor);
      valor = "";
    } else {
      valor += caracter;
    }
  }

  resultado.push(valor);

  return resultado;
}

export function descargarCSV(nombreArchivo, datos) {
  if (!datos.length) {
    alert("No hay datos para exportar.");
    return;
  }

  const encabezados = Object.keys(datos[0]);

  const filas = datos.map((item) => {
    return encabezados.map((campo) => {
      return `"${String(item[campo] ?? "").replaceAll('"', '""')}"`;
    }).join(",");
  });

  const contenido = [encabezados.join(","), ...filas].join("\n");
  const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });

  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(blob);
  enlace.download = nombreArchivo;
  enlace.click();
}