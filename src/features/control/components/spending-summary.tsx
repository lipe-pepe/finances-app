import { cn } from "cn";
import { SUMMARY_LABELS, overLimitMessage } from "@/lib/control-labels";
import { formatBrl } from "@/lib/money";
import { getAvailableCents, isOverLimit } from "@/lib/spending";

type SpendingSummaryProps = {
  plannedCents: number;
  spentCents: number;
};

/** Planejado, gasto e disponível da seleção; o disponível negativo é destacado (FR-017). */
export function SpendingSummary({ plannedCents, spentCents }: SpendingSummaryProps) {
  const availableCents = getAvailableCents(plannedCents, spentCents);
  const overLimit = isOverLimit(availableCents);

  return (
    <div className="flex flex-col gap-2">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col">
          <dt className="text-sm text-muted-foreground">{SUMMARY_LABELS.planned}</dt>
          <dd className="text-lg font-semibold tabular-nums">{formatBrl(plannedCents)}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-sm text-muted-foreground">{SUMMARY_LABELS.spent}</dt>
          <dd className="text-lg font-semibold tabular-nums">{formatBrl(spentCents)}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-sm text-muted-foreground">{SUMMARY_LABELS.available}</dt>
          <dd
            className={cn("text-lg font-semibold tabular-nums", overLimit && "text-destructive")}
          >
            {formatBrl(availableCents)}
          </dd>
        </div>
      </dl>
      {overLimit && (
        <p className="text-sm font-medium text-destructive">
          {overLimitMessage(-availableCents)}
        </p>
      )}
    </div>
  );
}
