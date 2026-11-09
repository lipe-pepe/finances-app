import { formatBrl } from "@/lib/money";

type SectionTotalProps = {
  label: string;
  totalCents: number;
};

/** Exibe o total de uma seção (receita, gastos ou metas) formatado em reais. */
export function SectionTotal({ label, totalCents }: SectionTotalProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t pt-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold tabular-nums">{formatBrl(totalCents)}</span>
    </div>
  );
}
