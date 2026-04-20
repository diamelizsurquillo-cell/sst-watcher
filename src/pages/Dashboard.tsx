import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Navigate } from "react-router-dom";
import { OBSERVACIONES } from "@/lib/mockData";
import { applyFilters, initialFilters } from "@/lib/sstFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sun, Moon, LogOut, HardHat, BarChart3, Building2, ListChecks, TrendingUp, Download } from "lucide-react";
import { FiltersBar } from "@/components/sst/FiltersBar";
import { TabResumen } from "@/components/sst/TabResumen";
import { TabAreas } from "@/components/sst/TabAreas";
import { TabSeguimiento } from "@/components/sst/TabSeguimiento";
import { TabTendencias } from "@/components/sst/TabTendencias";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [filters, setFilters] = useState(initialFilters);

  if (!user) return <Navigate to="/login" replace />;

  const data = useMemo(() => applyFilters(OBSERVACIONES, filters), [filters]);

  const areas = useMemo(() => Array.from(new Set(OBSERVACIONES.map((o) => o.area))).sort(), []);
  const responsables = useMemo(() => Array.from(new Set(OBSERVACIONES.map((o) => o.responsable))).sort(), []);

  const exportCSV = () => {
    const headers = ["codigo", "fecha", "area", "zona", "tipo", "estado", "prioridad", "responsable", "turno", "descripcion"];
    const rows = data.map((o) => headers.map((h) => `"${(o as any)[h] ?? ""}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `observaciones-sst-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exportado", { description: `${data.length} registros descargados` });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container flex items-center justify-between py-3 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-glow shrink-0">
              <HardHat className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-base sm:text-lg leading-tight truncate">SST Operativo</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Cumplimiento & Seguridad en el Trabajo</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} className="hidden sm:flex">
              <Download className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggle} title="Cambiar tema">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium">{user.username}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { logout(); toast("Sesión cerrada"); }} title="Salir">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Hero stats banner */}
        <div className="rounded-2xl gradient-hero p-6 sm:p-8 text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />
          <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary-foreground/60 mb-1">Panel Ejecutivo</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold">Monitoreo en tiempo real</h2>
              <p className="text-primary-foreground/70 text-sm mt-1">{data.length} observaciones en el rango seleccionado</p>
            </div>
            <div className="flex gap-4 sm:gap-6">
              <div>
                <p className="text-3xl sm:text-4xl font-display font-bold">{OBSERVACIONES.length}</p>
                <p className="text-xs text-primary-foreground/60 uppercase tracking-wider">Total histórico</p>
              </div>
              <div className="border-l border-primary-foreground/20 pl-4 sm:pl-6">
                <p className="text-3xl sm:text-4xl font-display font-bold text-warning">
                  {OBSERVACIONES.filter(o => o.prioridad === "Crítica" && o.estado !== "Cerrada").length}
                </p>
                <p className="text-xs text-primary-foreground/60 uppercase tracking-wider">Críticas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 gradient-card border border-border/60">
          <FiltersBar filters={filters} setFilters={setFilters} areas={areas} responsables={responsables} />
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="resumen" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-muted/60">
            <TabsTrigger value="resumen" className="gap-2 py-2.5 data-[state=active]:gradient-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md">
              <BarChart3 className="w-4 h-4" /> <span className="hidden sm:inline">Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="areas" className="gap-2 py-2.5 data-[state=active]:gradient-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md">
              <Building2 className="w-4 h-4" /> <span className="hidden sm:inline">Por Área</span>
            </TabsTrigger>
            <TabsTrigger value="seguimiento" className="gap-2 py-2.5 data-[state=active]:gradient-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md">
              <ListChecks className="w-4 h-4" /> <span className="hidden sm:inline">Seguimiento</span>
            </TabsTrigger>
            <TabsTrigger value="tendencias" className="gap-2 py-2.5 data-[state=active]:gradient-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md">
              <TrendingUp className="w-4 h-4" /> <span className="hidden sm:inline">Tendencias</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumen"><TabResumen data={data} /></TabsContent>
          <TabsContent value="areas"><TabAreas data={data} /></TabsContent>
          <TabsContent value="seguimiento"><TabSeguimiento data={data} /></TabsContent>
          <TabsContent value="tendencias"><TabTendencias data={data} /></TabsContent>
        </Tabs>

        <footer className="text-center text-xs text-muted-foreground py-6">
          SST Operativo · Demo · {new Date().getFullYear()}
        </footer>
      </main>
    </div>
  );
}
