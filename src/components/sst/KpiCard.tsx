import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  delta?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "critical" | "accent";
  pulse?: boolean;
}

const toneMap = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  critical: "text-critical",
  accent: "text-accent",
};

const bgMap = {
  default: "bg-muted",
  success: "bg-success/10",
  warning: "bg-warning/10",
  critical: "bg-critical/10",
  accent: "bg-accent/10",
};

export function KpiCard({ label, value, delta, icon: Icon, tone = "default", pulse }: KpiCardProps) {
  return (
    <Card className="relative overflow-hidden p-5 gradient-card border border-border/60 hover:shadow-elegant transition-smooth hover:-translate-y-0.5 group">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className={cn("font-display text-3xl font-bold tracking-tight", toneMap[tone])}>{value}</p>
          {delta && <p className="text-xs text-muted-foreground">{delta}</p>}
        </div>
        <div className={cn("rounded-xl p-3 transition-smooth group-hover:scale-110", bgMap[tone], pulse && "animate-pulse-ring")}>
          <Icon className={cn("w-5 h-5", toneMap[tone])} />
        </div>
      </div>
      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br from-accent/5 to-transparent" />
    </Card>
  );
}
