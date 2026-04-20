import { Observacion } from "./mockData";

export interface Filters {
  search: string;
  area: string;
  tipo: string;
  estado: string;
  prioridad: string;
  responsable: string;
  turno: string;
  rango: string; // días
}

export const initialFilters: Filters = {
  search: "", area: "", tipo: "", estado: "", prioridad: "", responsable: "", turno: "", rango: "180",
};

export function applyFilters(data: Observacion[], f: Filters): Observacion[] {
  const cutoff = Date.now() - parseInt(f.rango) * 86400000;
  const q = f.search.trim().toLowerCase();
  return data.filter((o) => {
    if (new Date(o.fecha).getTime() < cutoff) return false;
    if (f.area && o.area !== f.area) return false;
    if (f.tipo && o.tipo !== f.tipo) return false;
    if (f.estado && o.estado !== f.estado) return false;
    if (f.prioridad && o.prioridad !== f.prioridad) return false;
    if (f.responsable && o.responsable !== f.responsable) return false;
    if (f.turno && o.turno !== f.turno) return false;
    if (q) {
      const blob = `${o.codigo} ${o.descripcion} ${o.observador} ${o.zona} ${o.area} ${o.numeroAccion} ${o.responsable}`.toLowerCase();
      if (!blob.includes(q)) return false;
    }
    return true;
  });
}
