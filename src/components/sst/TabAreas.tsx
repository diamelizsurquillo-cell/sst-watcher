import { useMemo } from "react";
import { Observacion } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { KpiCard } from "./KpiCard";
import { Building2, Repeat, UserCog, MapPin } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";

export function TabAreas({ data }: { data: Observacion[] }) {
  const stats = useMemo(() => {
    const areas = Array.from(new Set(data.map((d) => d.area)));
    const porArea = areas.map((a) => {
      const subset = data.filter((d) => d.area === a);
      const tipos = ["Conducta", "Condición", "EPP", "Procedimiento"];
      const row: any = { area: a };
      tipos.forEach((t) => { row[t] = subset.filter((d) => d.tipo === t).length; });
      row.total = subset.length;
      return row;
    }).sort((a, b) => b.total - a.total);

    const recurrentes = data.filter((d) => d.recurrente).length;
    const tasaRecurrencia = data.length ? Math.round((recurrentes / data.length) * 100) : 0;

    const cargaResp: Record<string, number> = {};
    data.forEach((d) => { cargaResp[d.responsable] = (cargaResp[d.responsable] || 0) + 1; });
    const topResp = Object.entries(cargaResp).sort((a, b) => b[1] - a[1])[0];

    const zonas = Array.from(new Set(data.map((d) => d.zona)));
    const heatZonas = zonas.map((z) => {
      const subset = data.filter((d) => d.zona === z);
      const criticas = subset.filter((d) => d.prioridad === "Crítica" || d.prioridad === "Alta").length;
      return { zona: z, total: subset.length, criticas, ratio: subset.length ? criticas / subset.length : 0 };
    }).sort((a, b) => b.ratio - a.ratio);

    const sinObs = areas.filter((a) => data.filter((d) => d.area === a).length === 0).length;
    const pctSinObs = areas.length ? Math.round((sinObs / areas.length) * 100) : 0;

    return { porArea, tasaRecurrencia, topResp, heatZonas, pctSinObs };
  }, [data]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Áreas activas" value={stats.porArea.length} delta="Con observaciones" icon={Building2} tone="accent" />
        <KpiCard label="Tasa recurrencia" value={`${stats.tasaRecurrencia}%`} delta="Hallazgos repetidos" icon={Repeat} tone="warning" />
        <KpiCard label="Mayor carga" value={stats.topResp?.[0] ?? "—"} delta={`${stats.topResp?.[1] ?? 0} obs`} icon={UserCog} tone="default" />
        <KpiCard label="Áreas sin obs" value={`${stats.pctSinObs}%`} delta="Sin hallazgos" icon={MapPin} tone="success" />
      </div>

      <Card className="p-5 gradient-card">
        <h3 className="font-display font-semibold mb-4">Observaciones por área (apiladas por tipo)</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={stats.porArea}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="area" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
            <Legend />
            <Bar dataKey="Conducta" stackId="a" fill="hsl(var(--accent))" />
            <Bar dataKey="Condición" stackId="a" fill="hsl(var(--warning))" />
            <Bar dataKey="EPP" stackId="a" fill="hsl(var(--critical))" />
            <Bar dataKey="Procedimiento" stackId="a" fill="hsl(var(--success))" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 gradient-card">
          <h3 className="font-display font-semibold mb-4">Mapa de calor — zonas críticas</h3>
          <div className="grid grid-cols-3 gap-2">
            {stats.heatZonas.map((z) => {
              const intensity = Math.min(z.ratio, 1);
              return (
                <div
                  key={z.zona}
                  className="rounded-lg p-4 text-center transition-smooth hover:scale-105 cursor-default border border-border/50"
                  style={{ background: `hsl(var(--critical) / ${0.1 + intensity * 0.55})` }}
                  title={`${z.zona} • ${z.criticas}/${z.total} críticas`}
                >
                  <div className="font-display font-bold text-lg">{z.zona}</div>
                  <div className="text-xs opacity-80">{z.criticas} críticas</div>
                  <div className="text-[10px] mt-1 opacity-70">{z.total} obs</div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 gradient-card">
          <h3 className="font-display font-semibold mb-4">Semáforo por área</h3>
          <div className="space-y-2 max-h-[320px] overflow-auto scrollbar-thin pr-2">
            {stats.porArea.map((row) => {
              const tone = row.total > 50 ? "critical" : row.total > 25 ? "warning" : "success";
              return (
                <div key={row.area} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted transition-smooth">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full bg-${tone}`} />
                    <span className="font-medium text-sm">{row.area}</span>
                  </div>
                  <Badge variant="outline" className="font-mono">{row.total}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
