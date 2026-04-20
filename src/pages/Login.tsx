import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Lock, User, Eye, EyeOff, HardHat, Copy, Check } from "lucide-react";

const DEMO_USER = "administrador";
const DEMO_PASS = "CanalEjecutivo";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<"user" | "pass" | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const ok = login(u, p);
      setLoading(false);
      if (ok) {
        toast.success("Acceso concedido", { description: "Bienvenido al panel SST" });
        navigate("/");
      } else {
        toast.error("Credenciales inválidas", { description: "Verifica usuario y contraseña" });
      }
    }, 500);
  };

  const fill = () => { setU(DEMO_USER); setP(DEMO_PASS); };

  const copy = (val: string, which: "user" | "pass") => {
    navigator.clipboard.writeText(val);
    setCopied(which);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: "linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-glow/20 blur-3xl" />

      <div className="relative w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-accent shadow-glow mb-4">
            <HardHat className="w-8 h-8 text-accent-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-primary-foreground">SST Operativo</h1>
          <p className="text-primary-foreground/70 mt-2 text-sm">Cumplimiento & Seguridad en el Trabajo</p>
        </div>

        <div className="glass border border-primary-foreground/10 rounded-2xl p-8 shadow-premium">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-accent" />
            <h2 className="font-display font-semibold text-foreground">Acceso seguro</h2>
          </div>

          {/* Demo credentials block */}
          <div className="mb-6 p-4 rounded-xl border border-accent/30 bg-accent/5">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Credenciales demo
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-background/60 border border-border/60">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Usuario</p>
                  <p className="font-mono text-sm font-semibold truncate">{DEMO_USER}</p>
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => copy(DEMO_USER, "user")} title="Copiar usuario">
                  {copied === "user" ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-background/60 border border-border/60">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Contraseña</p>
                  <p className="font-mono text-sm font-semibold truncate">{DEMO_PASS}</p>
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => copy(DEMO_PASS, "pass")} title="Copiar contraseña">
                  {copied === "pass" ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <button type="button" onClick={fill} className="w-full mt-3 text-xs text-accent hover:underline font-medium">
              Autocompletar formulario →
            </button>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="user">Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="user" value={u} onChange={(e) => setU(e.target.value)} placeholder="administrador" className="pl-10 h-11" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pass">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="pass" type={show ? "text" : "password"} value={p} onChange={(e) => setP(e.target.value)} placeholder="••••••••••••" className="pl-10 pr-10 h-11" required />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 gradient-accent text-accent-foreground font-semibold hover:opacity-90 transition-smooth shadow-md">
              {loading ? "Verificando..." : "Iniciar sesión"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-primary-foreground/50 mt-6">
          Cuenta demo · Solo lectura
        </p>
      </div>
    </div>
  );
}
