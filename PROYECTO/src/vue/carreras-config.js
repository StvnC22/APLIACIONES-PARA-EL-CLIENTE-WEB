/* =========================================================
   CONFIGURACIÓN ULEAM PARA VUE
   Carreras y duración en semestres
   ========================================================= */

/*
  Este archivo se usa tanto para Vue como para la validación
  del formulario de estudiantes.

  Regla aplicada:
  - Carreras de 8 semestres: 7mo y 8vo.
  - Carreras de 9 semestres: 8vo y 9no.
  - Carreras de 10 semestres: 9no y 10mo.
  - Carreras de 11 semestres: 10mo y 11vo.
*/

window.ULEAM_DURACION_CARRERAS = {
  "Medicina": 11,
  "Odontología": 10,
  "Enfermería": 9,
  "Fisioterapia": 9,
  "Fonoaudiología": 8,
  "Laboratorio Clínico": 9,
  "Terapia Ocupacional": 8,
  "Psicología": 8,

  "Administración de Empresas": 8,
  "Mercadotecnia": 8,
  "Contabilidad y Auditoría": 8,
  "Auditoría y Control de Gestión": 8,
  "Finanzas": 8,
  "Comercio Exterior": 8,
  "Gestión de la Información Gerencial": 8,

  "Educación Inicial": 9,
  "Educación Especial": 9,
  "Psicología Educativa": 8,
  "Educación Básica": 9,
  "Pedagogía de la Actividad Física y el Deporte": 9,
  "Pedagogía de la Lengua y la Literatura": 9,
  "Pedagogía de los Idiomas Nacionales y Extranjeros": 9,
  "Turismo": 8,
  "Hospitalidad y Hotelería": 8,
  "Artes Plásticas": 8,
  "Sociología": 8,

  "Ingeniería Civil": 9,
  "Ingeniería Marítima": 9,
  "Electricidad": 9,
  "Arquitectura": 10,
  "Ingeniería Industrial": 8,
  "Ingeniería de Alimentos": 8,

  "Ingeniería Agropecuaria": 9,
  "Agronegocios": 8,
  "Ingeniería Agroindustrial": 9,
  "Ingeniería Ambiental": 9,
  "Ingeniería en Tecnologías de la Información": 9,
  "Ingeniería en Software": 8,
  "Ingeniería en Sistema": 8,
  "Biología": 8,

  "Derecho": 9,
  "Economía": 9,
  "Trabajo Social": 8,
  "Comunicación": 8
};

window.ULEAM_CARRERAS = Object.keys(window.ULEAM_DURACION_CARRERAS);

window.obtenerNivelesULEAM = function obtenerNivelesULEAM(carrera) {
  const duracion = window.ULEAM_DURACION_CARRERAS[carrera];

  if (duracion === 8) {
    return ["7mo", "8vo"];
  }

  if (duracion === 9) {
    return ["8vo", "9no"];
  }

  if (duracion === 10) {
    return ["9no", "10mo"];
  }

  if (duracion === 11) {
    return ["10mo", "11vo"];
  }

  return [];
};
