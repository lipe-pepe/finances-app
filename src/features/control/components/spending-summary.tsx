import { TriangleAlert } from "lucide-react";
import { cn } from "cn";
import { UsageBar } from "@/components/usage-bar";
import { SUMMARY_LABELS, overLimitMessage, usedLabel } from "@/lib/control-labels";
import { formatBrl } from "@/lib/money";
import {
  getAvailableCents,
  getUsageBarPercentage,
  getUsedPercentage,
  isOverLimit,
} from "@/lib/spending";

type SpendingSummaryProps = {
  plannedCents: number;
  spentCents: number;
};

/**
 * "Disponível" em destaque, barra de uso e gasto/planejado/usado da seleção (FR-007–FR-009).
 * O disponível negativo fica em vermelho com ícone e texto de alerta (não só pela cor).
 */
export function SpendingSummary({ plannedCents, spentCents }: SpendingSummaryProps) {
  const availableCents = getAvailableCents(plannedCents, spentCents);
  const overLimit = isOverLimit(availableCents);
  const used = getUsedPercentage(spentCents, plannedCents);

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
        <UsageBar value={getUsageBarPercentage(used)} tone={overLimit ? "danger" : "brand"} />
        <dl className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">{SUMMARY_LABELS.spent}</dt>
            <dd className="font-semibold tabular-nums">{formatBrl(spentCents)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">{SUMMARY_LABELS.planned}</dt>
            <dd className="font-semibold tabular-nums">{formatBrl(plannedCents)}</dd>
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
