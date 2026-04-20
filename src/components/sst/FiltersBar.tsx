import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { Filters } from "@/lib/sstFilters";

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
  areas: string[];
  responsables: string[];
}

const ALL = "__all__";

export function FiltersBar({ filters, setFilters, areas, responsables }: Props) {
  const update = (k: keyof Filters, v: string) =>
    setFilters({ ...filters, [k]: v === ALL ? "" : v });

  const reset = () =>
    setFilters({ search: "", area: "", tipo: "", estado: "", prioridad: "", responsable: "", turno: "", rango: "180" });

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 items-end">
      <div className="lg:col-span-2 xl:col-span-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar código, palabra, observador, ubicación, AC..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-10 h-10"
          />
        </div>
      </div>

      <Select value={filters.area || ALL} onValueChange={(v) => update("area", v)}>
        <SelectTrigger className="h-10"><SelectValue placeholder="Área" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas las áreas</SelectItem>
          {areas.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.tipo || ALL} onValueChange={(v) => update("tipo", v)}>
        <SelectTrigger className="h-10"><SelectValue placeholder="Tipo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos los tipos</SelectItem>
          <SelectItem value="Conducta">Conducta</SelectItem>
          <SelectItem value="Condición">Condición</SelectItem>
          <SelectItem value="EPP">EPP</SelectItem>
          <SelectItem value="Procedimiento">Procedimiento</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.estado || ALL} onValueChange={(v) => update("estado", v)}>
        <SelectTrigger className="h-10"><SelectValue placeholder="Estado" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos los estados</SelectItem>
          <SelectItem value="Abierta">Abierta</SelectItem>
          <SelectItem value="En proceso">En proceso</SelectItem>
          <SelectItem value="Cerrada">Cerrada</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.prioridad || ALL} onValueChange={(v) => update("prioridad", v)}>
        <SelectTrigger className="h-10"><SelectValue placeholder="Prioridad" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todas</SelectItem>
          <SelectItem value="Baja">Baja</SelectItem>
          <SelectItem value="Media">Media</SelectItem>
          <SelectItem value="Alta">Alta</SelectItem>
          <SelectItem value="Crítica">Crítica</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.responsable || ALL} onValueChange={(v) => update("responsable", v)}>
        <SelectTrigger className="h-10"><SelectValue placeholder="Responsable" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos</SelectItem>
          {responsables.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.turno || ALL} onValueChange={(v) => update("turno", v)}>
        <SelectTrigger className="h-10"><SelectValue placeholder="Turno" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Todos</SelectItem>
          <SelectItem value="Mañana">Mañana</SelectItem>
          <SelectItem value="Tarde">Tarde</SelectItem>
          <SelectItem value="Noche">Noche</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Select value={filters.rango} onValueChange={(v) => setFilters({ ...filters, rango: v })}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 días</SelectItem>
            <SelectItem value="30">30 días</SelectItem>
            <SelectItem value="90">90 días</SelectItem>
            <SelectItem value="180">180 días</SelectItem>
            <SelectItem value="365">1 año</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={reset} title="Limpiar filtros" className="h-10 w-10 shrink-0">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
