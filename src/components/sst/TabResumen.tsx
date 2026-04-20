import { useMemo } from "react";
import { Observacion } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { KpiCard } from "./KpiCard";
import { Activity, AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
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

    return { total, cierreEnPlazo, criticasAbiertas, cumplimiento, tendencia, estados };
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
          <h3 className="font-display font-semibold mb-4">Tendencia mensual</h3>
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
          <h3 className="font-display font-semibold mb-4">Cumplimiento</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadialBarChart innerRadius="60%" outerRadius="100%" data={[{ name: "Cump", value: stats.cumplimiento, fill: "hsl(var(--accent))" }]} startAngle={90} endAngle={-270}>
              <RadialBar background dataKey="value" cornerRadius={12} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-display font-bold" style={{ fontSize: 36 }}>
                {stats.cumplimiento}%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5 gradient-card">
        <h3 className="font-display font-semibold mb-4">Distribución por estado</h3>
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
