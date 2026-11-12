"use client";
// Client Component: o valor da parte e o alerta acompanham as porcentagens das partes em tempo
// real, durante o arraste dos sliders (features 006 e 007).

import { TriangleAlert } from "lucide-react";
import { cn } from "cn";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UsageBar } from "@/components/usage-bar";
import { useAllocation } from "@/features/allocation/components/allocation-provider";
import { PART_DOT_CLASSES } from "@/features/planning/components/part-picker";
import { PART_LABELS, partExcessMessage, partPlannedLabel } from "@/lib/part-labels";
import { getExcessCents, isOverBudget } from "@/lib/planning";
import { OVER_BUDGET_TITLE } from "@/lib/planning-labels";
import { getPartCents, type PresentPart } from "@/lib/present-parts";
import { getUsageBarPercentage, getUsedPercentage } from "@/lib/spending";

type PartBudgetProps = {
  part: PresentPart;
  revenueCents: number;
  /** Soma dos gastos planejados da parte */
  plannedCents: number;
};

/** Planejado × valor da parte selecionada, com alerta quando ela é excedida (FR-009, FR-014). */
export function PartBudget({ part, revenueCents, plannedCents }: PartBudgetProps) {
  const { parts } = useAllocation();
  const limit = getPartCents(revenueCents, parts)[part];
  const over = isOverBudget(plannedCents, limit);

  return (
    <div data-testid={`part-budget-${part}`} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
        <span className="flex items-center gap-2 font-semibold">
          <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", PART_DOT_CLASSES[part])} />
          {PART_LABELS[part]}
        </span>
        <span className={cn("tabular-nums", over ? "font-semibold text-destructive" : "text-muted-foreground")}>
          {partPlannedLabel(plannedCents, limit)}
        </span>
      </div>
      <UsageBar
        value={getUsageBarPercentage(getUsedPercentage(plannedCents, limit))}
        tone={over ? "danger" : `part-${part}`}
      />
      {over && (
        <Alert variant="destructive" className="rounded-xl border-transparent bg-danger-soft px-4 py-3.5">
          <TriangleAlert />
          <AlertTitle>{OVER_BUDGET_TITLE}</AlertTitle>
          <AlertDescription>{partExcessMessage(part, getExcessCents(plannedCents, limit))}.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
