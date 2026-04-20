import { useMemo } from "react";
import { Observacion } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { KpiCard } from "./KpiCard";
import { Clock, AlertCircle, ShieldCheck, Timer } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

export function TabSeguimiento({ data }: { data: Observacion[] }) {
  const stats = useMemo(() => {
    const pendientes = data.filter((d) => d.estado !== "Cerrada").length;
    const cerradas = data.filter((d) => d.estado === "Cerrada");
    const vencidas = data.filter((d) => d.estado !== "Cerrada" && d.diasParaCierre > 30).length;
    const aTiempo = pendientes - vencidas;
    const validadas = data.filter((d) => d.validadaSST).length;
    const pctValidadas = data.length ? Math.round((validadas / data.length) * 100) : 0;
    const promedioCierre = cerradas.length
      ? Math.round(cerradas.reduce((acc, d) => acc + d.diasParaCierre, 0) / cerradas.length)
      : 0;

    const estadoData = [
      { name: "Abiertas", value: data.filter((d) => d.estado === "Abierta").length },
      { name: "En proceso", value: data.filter((d) => d.estado === "En proceso").length },
      { name: "Cerradas", value: data.filter((d) => d.estado === "Cerrada").length },
    ];

    const tipos = ["Conducta", "Condición", "EPP", "Procedimiento"] as const;
    const cierrePorTipo = tipos.map((t) => {
      const subset = cerradas.filter((d) => d.tipo === t);
      const promedio = subset.length ? Math.round(subset.reduce((a, d) => a + d.diasParaCierre, 0) / subset.length) : 0;
      const max = subset.reduce((m, d) => Math.max(m, d.diasParaCierre), 0);
      const min = subset.reduce((m, d) => Math.min(m, d.diasParaCierre), 100);
      return { tipo: t, promedio, max, min: subset.length ? min : 0 };
    });

    const recientes = [...data].sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha)).slice(0, 8);

    return { pendientes, vencidas, aTiempo, pctValidadas, promedioCierre, estadoData, cierrePorTipo, recientes };
  }, [data]);

  const colors = ["hsl(var(--warning))", "hsl(var(--accent))", "hsl(var(--success))"];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Pendientes" value={stats.pendientes} delta={`${stats.aTiempo} a tiempo`} icon={Clock} tone="warning" />
        <KpiCard label="Vencidas" value={stats.vencidas} delta=">30 días sin cierre" icon={AlertCircle} tone="critical" pulse={stats.vencidas > 0} />
        <KpiCard label="% Validadas SST" value={`${stats.pctValidadas}%`} delta="Verificadas" icon={ShieldCheck} tone="success" />
        <KpiCard label="Días prom. cierre" value={stats.promedioCierre} delta="Tiempo medio" icon={Timer} tone="accent" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 gradient-card">
          <h3 className="font-display font-semibold mb-4">Estado de acciones</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.estadoData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={90} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {stats.estadoData.map((_, i) => <Cell key={i} fill={colors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 gradient-card">
          <h3 className="font-display font-semibold mb-4">Días de cierre por tipo (min · prom · max)</h3>
          <div className="space-y-4 mt-4">
            {stats.cierrePorTipo.map((t) => (
              <UITooltip key={t.tipo}>
                <TooltipTrigger asChild>
                  <div className="cursor-pointer">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{t.tipo}</span>
                      <span className="font-mono text-muted-foreground">{t.min}–{t.max}d · μ{t.promedio}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full relative overflow-hidden">
                      <div className="absolute h-full gradient-accent rounded-full" style={{ width: `${(t.promedio / 45) * 100}%` }} />
                      <div className="absolute h-full w-1 bg-foreground/60" style={{ left: `${(t.min / 45) * 100}%` }} />
                      <div className="absolute h-full w-1 bg-critical" style={{ left: `${(t.max / 45) * 100}%` }} />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs space-y-0.5">
                    <p className="font-semibold">{t.tipo}</p>
                    <p>Mínimo: <span className="font-mono">{t.min} días</span></p>
                    <p>Promedio: <span className="font-mono">{t.promedio} días</span></p>
                    <p>Máximo: <span className="font-mono">{t.max} días</span></p>
                  </div>
                </TooltipContent>
              </UITooltip>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5 gradient-card">
        <h3 className="font-display font-semibold mb-4">Acciones recientes (Gantt simplificado)</h3>
        <div className="space-y-2">
          {stats.recientes.map((o) => {
            const w = Math.min(100, (o.diasParaCierre / 45) * 100);
            const tone = o.estado === "Cerrada" ? "bg-success" : o.diasParaCierre > 30 ? "bg-critical" : "bg-accent";
            return (
              <UITooltip key={o.id}>
                <TooltipTrigger asChild>
                  <div className="grid grid-cols-12 gap-3 items-center text-sm cursor-pointer hover:bg-muted/40 rounded-lg p-1 transition-smooth">
                    <span className="col-span-3 lg:col-span-2 font-mono text-xs text-muted-foreground">{o.codigo}</span>
                    <span className="col-span-3 lg:col-span-2 truncate text-xs">{o.responsable}</span>
                    <div className="col-span-6 lg:col-span-7 h-3 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${tone} transition-smooth`} style={{ width: `${w}%` }} />
                    </div>
                    <span className="hidden lg:inline col-span-1 text-xs font-mono text-right">{o.diasParaCierre}d</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs space-y-0.5 max-w-xs">
                    <p className="font-semibold">{o.codigo} · {o.tipo}</p>
                    <p className="text-muted-foreground">{o.descripcion}</p>
                    <p>Área: <span className="font-mono">{o.area}</span> · Zona: <span className="font-mono">{o.zona}</span></p>
                    <p>Estado: <span className="font-mono">{o.estado}</span> · Prioridad: <span className="font-mono">{o.prioridad}</span></p>
                    <p>Días para cierre: <span className="font-mono">{o.diasParaCierre}</span></p>
                    <p>Fecha: <span className="font-mono">{format(new Date(o.fecha), "dd/MM/yyyy")}</span></p>
                  </div>
                </TooltipContent>
              </UITooltip>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
