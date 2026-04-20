import { useMemo } from "react";
import { Observacion } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { KpiCard } from "./KpiCard";
import { Activity, AlertTriangle, CheckCircle2, ShieldCheck, Info } from "lucide-react";
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar
} from "recharts";
import { format, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";

const COLORS = ["hsl(var(--accent))", "hsl(var(--warning))", "hsl(var(--success))"];

export function TabResumen({ data }: { data: Observacion[] }) {
  const stats = useMemo(() => {
    const total = data.length;
    const cerradas = data.filter((d) => d.estado === "Cerrada");
    const enPlazo = cerradas.filter((d) => d.diasParaCierre <= 15).length;
    const cierreEnPlazo = cerradas.length ? Math.round((enPlazo / cerradas.length) * 100) : 0;
    const criticasAbiertas = data.filter((d) => d.prioridad === "Crítica" && d.estado !== "Cerrada").length;
    const validadas = data.filter((d) => d.validadaSST).length;
    const cumplimiento = total ? Math.round((validadas / total) * 100) : 0;

    const byMonth: Record<string, number> = {};
    data.forEach((o) => {
      const k = format(startOfMonth(new Date(o.fecha)), "MMM yy", { locale: es });
      byMonth[k] = (byMonth[k] || 0) + 1;
    });
    const tendencia = Object.entries(byMonth).map(([mes, total]) => ({ mes, total })).slice(-8);

    const estados = ["Abierta", "En proceso", "Cerrada"].map((e) => ({
      name: e, value: data.filter((d) => d.estado === e).length,
    }));

    return { total, cierreEnPlazo, criticasAbiertas, cumplimiento, validadas, tendencia, estados };
  }, [data]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total observaciones" value={stats.total} delta="Últimos meses" icon={Activity} tone="accent" />
        <KpiCard label="% Cierre en plazo" value={`${stats.cierreEnPlazo}%`} delta="Meta: 85%" icon={CheckCircle2} tone="success" />
        <KpiCard label="Críticas abiertas" value={stats.criticasAbiertas} delta="Requieren atención" icon={AlertTriangle} tone="critical" pulse={stats.criticasAbiertas > 0} />
        <KpiCard label="Cumplimiento SST" value={`${stats.cumplimiento}%`} delta="Validadas por SST" icon={ShieldCheck} tone="accent" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2 gradient-card">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-display font-semibold">Tendencia mensual</h3>
            <TooltipProvider>
              <UiTooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px] text-center">
                  <p>Muestra la cantidad total de observaciones reportadas mes a mes, permitiendo identificar picos o bajas en el reporte.</p>
                </TooltipContent>
              </UiTooltip>
            </TooltipProvider>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.tendencia}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="total" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--accent))" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 gradient-card">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-display font-semibold">Cumplimiento</h3>
            <TooltipProvider>
              <UiTooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px] text-center">
                  <p>Porcentaje del total de observaciones que han sido formalmente validadas por el área de Seguridad y Salud en el Trabajo.</p>
                </TooltipContent>
              </UiTooltip>
            </TooltipProvider>
          </div>
          <div className="relative w-full h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { value: stats.cumplimiento, fill: stats.cumplimiento < 60 ? "hsl(var(--critical))" : stats.cumplimiento < 85 ? "hsl(var(--warning))" : "hsl(var(--success))" },
                    { value: 100 - stats.cumplimiento, fill: "hsl(var(--muted))" }
                  ]}
                  cx="50%"
                  cy="75%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius="70%"
                  outerRadius="90%"
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 pointer-events-none">
              <span className="text-5xl font-display font-bold tracking-tight" style={{ color: stats.cumplimiento < 60 ? 'hsl(var(--critical))' : stats.cumplimiento < 85 ? 'hsl(var(--warning))' : 'hsl(var(--success))' }}>
                {stats.cumplimiento}%
              </span>
              <span className="text-sm text-muted-foreground mt-2 font-medium">
                {stats.validadas} de {stats.total} validadas
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5 gradient-card">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-display font-semibold">Distribución por estado</h3>
          <TooltipProvider>
            <UiTooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px] text-center">
                <p>Muestra el volumen de todas las observaciones históricas divididas por su estado actual de resolución.</p>
              </TooltipContent>
            </UiTooltip>
          </TooltipProvider>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={stats.estados} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
              {stats.estados.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
