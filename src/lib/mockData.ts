// Generador de 500 observaciones SST realistas
export type ObservacionEstado = "Abierta" | "En proceso" | "Cerrada";
export type ObservacionTipo = "Conducta" | "Condición" | "EPP" | "Procedimiento";
export type Prioridad = "Baja" | "Media" | "Alta" | "Crítica";
export type Turno = "Mañana" | "Tarde" | "Noche";

export interface Observacion {
  id: string;
  codigo: string;
  fecha: string; // ISO
  fechaCierre?: string;
  area: string;
  proyecto: string;
  zona: string;
  tipo: ObservacionTipo;
  estado: ObservacionEstado;
  prioridad: Prioridad;
  responsable: string;
  observador: string;
  turno: Turno;
  descripcion: string;
  accionCorrectiva: string;
  numeroAccion: string;
  diasParaCierre: number;
  validadaSST: boolean;
  recurrente: boolean;
}

const AREAS = ["Producción", "Mantenimiento", "Logística", "Calidad", "Almacén", "Oficinas", "Laboratorio", "Energía"];
const PROYECTOS = ["Planta Norte", "Planta Sur", "Expansión 2025", "Modernización", "Canal Ejecutivo"];
const ZONAS = ["Z-A1", "Z-A2", "Z-B1", "Z-B2", "Z-C1", "Z-C2", "Z-D1", "Z-D2", "Z-E1"];
const RESPONSABLES = ["C. Ramírez", "M. Pérez", "L. González", "A. Torres", "J. Vargas", "S. Mendoza", "D. Reyes", "P. Castillo", "R. Núñez", "F. Salinas"];
const OBSERVADORES = ["Insp. Morales", "Insp. Quispe", "Insp. Flores", "Insp. Rojas", "Insp. Cárdenas", "Insp. Jiménez"];
const TIPOS: ObservacionTipo[] = ["Conducta", "Condición", "EPP", "Procedimiento"];
const ESTADOS: ObservacionEstado[] = ["Abierta", "En proceso", "Cerrada"];
const PRIORIDADES: Prioridad[] = ["Baja", "Media", "Alta", "Crítica"];
const TURNOS: Turno[] = ["Mañana", "Tarde", "Noche"];

const DESCRIPCIONES: Record<ObservacionTipo, string[]> = {
  Conducta: [
    "Trabajador no respeta señalización de área restringida",
    "Uso indebido de equipos en zona operativa",
    "No se realizó charla de 5 minutos al iniciar turno",
    "Personal corriendo en zona de tránsito vehicular",
  ],
  Condición: [
    "Piso resbaloso por derrame de aceite no contenido",
    "Cable eléctrico expuesto en pasillo principal",
    "Iluminación insuficiente en escalera de emergencia",
    "Barandal suelto en plataforma elevada",
  ],
  EPP: [
    "Operador sin casco en zona obligatoria",
    "Falta de protección auditiva en zona de ruido >85 dB",
    "Lentes de seguridad rayados / inservibles",
    "Botas de seguridad sin punta reforzada",
  ],
  Procedimiento: [
    "No se diligenció permiso de trabajo en altura",
    "Bloqueo y etiquetado (LOTO) incompleto",
    "Falta análisis de riesgo previo a la tarea",
    "Procedimiento desactualizado en uso",
  ],
};

const ACCIONES = [
  "Capacitación específica al personal involucrado",
  "Reposición inmediata de EPP",
  "Reparación correctiva por mantenimiento",
  "Actualización de procedimiento operativo",
  "Refuerzo de señalización en zona",
  "Auditoría de cumplimiento programada",
];

let seed = 42;
const rand = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

const pad = (n: number, len = 4) => String(n).padStart(len, "0");

export function generarObservaciones(n = 500): Observacion[] {
  const ahora = new Date();
  const observaciones: Observacion[] = [];

  for (let i = 1; i <= n; i++) {
    const tipo = pick(TIPOS);
    const prioridad = pick(PRIORIDADES);
    const estado = pick(ESTADOS);
    const diasAtras = randInt(0, 180);
    const fecha = new Date(ahora.getTime() - diasAtras * 86400000);

    const diasCierre = randInt(1, 45);
    const cerrada = estado === "Cerrada";
    const fechaCierre = cerrada ? new Date(fecha.getTime() + diasCierre * 86400000).toISOString() : undefined;

    observaciones.push({
      id: `obs-${i}`,
      codigo: `SST-${pad(i)}`,
      fecha: fecha.toISOString(),
      fechaCierre,
      area: pick(AREAS),
      proyecto: pick(PROYECTOS),
      zona: pick(ZONAS),
      tipo,
      estado,
      prioridad,
      responsable: pick(RESPONSABLES),
      observador: pick(OBSERVADORES),
      turno: pick(TURNOS),
      descripcion: pick(DESCRIPCIONES[tipo]),
      accionCorrectiva: pick(ACCIONES),
      numeroAccion: `AC-${pad(i)}`,
      diasParaCierre: diasCierre,
      validadaSST: rand() > 0.35,
      recurrente: rand() > 0.7,
    });
  }
  return observaciones;
}

export const OBSERVACIONES = generarObservaciones(500);
