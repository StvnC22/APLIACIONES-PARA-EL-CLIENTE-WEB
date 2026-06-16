export const duracionCarreras = {
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

export const carreras = Object.keys(duracionCarreras);

export function obtenerNivelesPorCarrera(carrera) {
  const duracion = duracionCarreras[carrera];

  if (duracion === 8) return ["7mo", "8vo"];
  if (duracion === 9) return ["8vo", "9no"];
  if (duracion === 10) return ["9no", "10mo"];
  if (duracion === 11) return ["10mo", "11vo"];

  return [];
}