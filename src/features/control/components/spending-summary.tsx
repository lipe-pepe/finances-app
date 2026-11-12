import { TriangleAlert } from "lucide-react";
import { cn } from "cn";
import { SUMMARY_LABELS, overLimitMessage, usedLabel } from "@/lib/control-labels";
import { formatBrl } from "@/lib/money";
import { getAvailableCents, getUsedPercentage, isOverLimit } from "@/lib/spending";

type SpendingSummaryProps = {
  /** Limite da parte ativa ou de todo o Momento Presente (feature 006, FR-029) */
  limitCents: number;
  spentCents: number;
};

/**
 * "Disponível" em destaque e gasto/limite/usado da seleção (FR-007–FR-009). A barra de uso por
 * parte fica acima do resumo, no dashboard (feature 006, FR-024).
 * O disponível negativo fica em vermelho com ícone e texto de alerta (não só pela cor).
 */
export function SpendingSummary({ limitCents, spentCents }: SpendingSummaryProps) {
  const availableCents = getAvailableCents(limitCents, spentCents);
  const overLimit = isOverLimit(availableCents);
  const used = getUsedPercentage(spentCents, limitCents);

  return (
    <div className="flex flex-col gap-5">
      <dl className="flex flex-col gap-1">
        <dt className={cn("text-sm", overLimit ? "text-destructive" : "text-muted-foreground")}>
          {SUMMARY_LABELS.available}
        </dt>
        <dd
          className={cn(
            "text-display font-semibold tracking-tight tabular-nums break-words",
            overLimit && "text-destructive",
          )}
        >
          {formatBrl(availableCents)}
        </dd>
        {overLimit && (
          <dd className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <TriangleAlert aria-hidden="true" className="size-4" />
            {overLimitMessage(-availableCents)}
          </dd>
        )}
      </dl>
      <div className="flex flex-col gap-2">
        <dl className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">{SUMMARY_LABELS.spent}</dt>
            <dd className="font-semibold tabular-nums">{formatBrl(spentCents)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">{SUMMARY_LABELS.limit}</dt>
            <dd className="font-semibold tabular-nums">{formatBrl(limitCents)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">{SUMMARY_LABELS.used}</dt>
            <dd className="font-semibold tabular-nums">{usedLabel(used)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
