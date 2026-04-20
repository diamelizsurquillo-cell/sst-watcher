import { useMemo } from "react";
import { Observacion } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { KpiCard } from "./KpiCard";
import { TrendingUp, AlertOctagon, Clock4, Repeat2, Info } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ComposedChart, Line, Bar } from "recharts";
import { TooltipProvider, Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function TabTendencias({ data }: { data: Observacion[] }) {
  const stats = useMemo(() => {
    const horas = Array.from({ length: 24 }, (_, h) => ({ hora: `${h}h`, value: 0 }));
    data.forEach((o) => { horas[new Date(o.fecha).getHours()].value++; });

    const dias: Record<string, number> = {};
    data.forEach((o) => {
      const k = new Date(o.fecha).toISOString().slice(0, 10);
      dias[k] = (dias[k] || 0) + 1;
    });
    const dailySorted = Object.entries(dias).sort(([a], [b]) => a.localeCompare(b)).slice(-30)
      .map(([fecha, count]) => ({ fecha: fecha.slice(5), count }));

    const totalDaily = dailySorted.reduce((a, d) => a + d.count, 0);
    const meanDaily = dailySorted.length ? totalDaily / dailySorted.length : 0;
    const variance = dailySorted.length
      ? dailySorted.reduce((a, d) => a + Math.pow(d.count - meanDaily, 2), 0) / dailySorted.length
      : 0;
    const std = Math.sqrt(variance);
    const ucl = Math.round(meanDaily + 2 * std);
    const lcl = Math.max(0, Math.round(meanDaily - 2 * std));

    const dailyWithLimits = dailySorted.map((d) => ({ ...d, ucl, lcl, mean: Math.round(meanDaily) }));

    const picoDia = dailySorted.reduce((m, d) => (d.count > m.count ? d : m), { fecha: "—", count: 0 });
    const horaPico = horas.reduce((m, h) => (h.value > m.value ? h : m), { hora: "—", value: 0 });
    const noConformidades = data.filter((d) => d.prioridad === "Crítica" && !d.validadaSST).length;
    const recurrentes = data.filter((d) => d.recurrente).length;

    const alertas = dailyWithLimits.filter((d) => d.count > ucl).slice(-5);

    return { horas, dailyWithLimits, picoDia, horaPico, noConformidades, recurrentes, alertas, ucl };
  }, [data]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Pico diario" value={stats.picoDia.count} delta={`${stats.picoDia.fecha}`} icon={TrendingUp} tone="accent" />
        <KpiCard label="Hora de mayor riesgo" value={stats.horaPico.hora} delta={`${stats.horaPico.value} obs`} icon={Clock4} tone="warning" />
        <KpiCard label="No conformidades" value={stats.noConformidades} delta="Críticas no validadas" icon={AlertOctagon} tone="critical" pulse={stats.noConformidades > 0} />
        <KpiCard label="Patrón recurrente" value={stats.recurrentes} delta="Hallazgos repetidos" icon={Repeat2} tone="warning" />
      </div>

      <Card className="p-5 gradient-card">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-display font-semibold">Densidad por hora del día</h3>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px] text-center">
                <p>Distribución horaria del registro de observaciones para identificar las horas pico de riesgo.</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={stats.horas}>
            <defs>
              <linearGradient id="colorHora" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.6} />
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="hora" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <Area type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#colorHora)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-5 gradient-card">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-display font-semibold">Gráfico de control (límite superior)</h3>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px] text-center">
                <p>Monitoriza la cantidad diaria de observaciones frente al Límite Superior de Control (LSC) estadístico.</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={stats.dailyWithLimits}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="fecha" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <Bar dataKey="count" fill="hsl(var(--accent) / 0.6)" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="mean" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
            <ReferenceLine y={stats.ucl} stroke="hsl(var(--critical))" strokeDasharray="6 4" label={{ value: `LSC ${stats.ucl}`, fill: "hsl(var(--critical))", fontSize: 11, position: "right" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {stats.alertas.length > 0 && (
        <Card className="p-5 border-critical/40 bg-critical/5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-display font-semibold flex items-center gap-2 text-critical">
              <AlertOctagon className="w-5 h-5 animate-pulse" /> Alertas automáticas — superación de LSC
            </h3>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-critical/60 hover:text-critical transition-colors cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px] text-center">
                  <p>Días en los que el número de observaciones superó el límite estadístico normal, requiriendo revisión urgente.</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {stats.alertas.map((a) => (
              <UITooltip key={a.fecha}>
                <TooltipTrigger asChild>
                  <div className="p-3 rounded-lg bg-critical/10 border border-critical/30 flex justify-between items-center cursor-pointer hover:bg-critical/20 transition-smooth">
                    <span className="font-medium text-sm">📅 {a.fecha}</span>
                    <span className="font-mono text-critical font-bold">{a.count} obs</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs space-y-0.5">
                    <p className="font-semibold text-critical">No conformidad detectada</p>
                    <p>Día: <span className="font-mono">{a.fecha}</span></p>
                    <p>Observaciones: <span className="font-mono">{a.count}</span></p>
                    <p>Límite superior: <span className="font-mono">{stats.ucl}</span></p>
                    <p className="text-muted-foreground">Excede el control estadístico</p>
                  </div>
                </TooltipContent>
              </UITooltip>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
