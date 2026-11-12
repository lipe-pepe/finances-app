import { cn } from "cn";

export type UsageBarTone =
  | "brand"
  | "section"
  | "income"
  | "present"
  | "future"
  | "danger"
  | "part-essentials"
  | "part-education"
  | "part-free";

const TONE_CLASSES: Record<UsageBarTone, string> = {
  brand: "bg-primary",
  section: "bg-section",
  income: "bg-income",
  present: "bg-present",
  future: "bg-future",
  danger: "bg-destructive",
  "part-essentials": "bg-part-essentials",
  "part-education": "bg-part-education",
  "part-free": "bg-part-free",
};

type UsageBarProps = {
  /** Percentual de 0 a 100 (valores acima são limitados) */
  value: number;
  tone: UsageBarTone;
  className?: string;
};

/**
 * Barra de uso do planejado. É decorativa (aria-hidden): o percentual e os valores ficam no
 * texto ao lado, para não depender só da cor (Princípio VI).
 */
export function UsageBar({ value, tone, className }: UsageBarProps) {
  const width = Math.min(100, Math.max(0, value));
  return (
    <div aria-hidden="true" className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      {/* A largura é um dado (percentual), não um valor de estilo fixo */}
      <div className={cn("h-full rounded-full", TONE_CLASSES[tone])} style={{ width: `${width}%` }} />
    </div>
  );
}
