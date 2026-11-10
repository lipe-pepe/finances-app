import { formatBrl } from "@/lib/money";

type SectionTotalProps = {
  label: string;
  totalCents: number;
};

/** Exibe o total de uma seção (receita, gastos ou metas) formatado em reais. */
export function SectionTotal({ label, totalCents }: SectionTotalProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 pt-1 font-semibold">
      <span>{label}</span>
      <span className="tabular-nums">{formatBrl(totalCents)}</span>
    </div>
  );
}
