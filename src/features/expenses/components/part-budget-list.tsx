"use client";
// Client Component: valores e alertas acompanham as porcentagens das partes em tempo real,
// durante o arraste dos sliders (feature 006).

import { TriangleAlert } from "lucide-react";
import { cn } from "cn";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UsageBar } from "@/components/usage-bar";
import { useAllocation } from "@/features/allocation/components/allocation-provider";
import { PART_DOT_CLASSES } from "@/features/planning/components/part-picker";
import { PART_LABELS, partExcessMessage, partPlannedLabel } from "@/lib/part-labels";
import { getExcessCents, isOverBudget } from "@/lib/planning";
import { getUsageBarPercentage, getUsedPercentage } from "@/lib/spending";
import { OVER_BUDGET_TITLE } from "@/lib/planning-labels";
import { PRESENT_PARTS, getPartCents, type PartCents } from "@/lib/present-parts";

type PartBudgetListProps = {
  revenueCents: number;
  /** Soma dos gastos planejados de cada parte */
  plannedCentsByPart: PartCents;
};

/** Planejado × valor de cada parte, com alerta próprio quando a parte é excedida (FR-013/014). */
export function PartBudgetList({ revenueCents, plannedCentsByPart }: PartBudgetListProps) {
  const { parts } = useAllocation();
  const limits = getPartCents(revenueCents, parts);

  return (
    <ul className="flex flex-col gap-3">
      {PRESENT_PARTS.map((part) => {
        const planned = plannedCentsByPart[part];
        const limit = limits[part];
        const over = isOverBudget(planned, limit);
        return (
          <li key={part} data-testid={`part-budget-${part}`} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
              <span className="flex items-center gap-2 font-semibold">
                <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", PART_DOT_CLASSES[part])} />
                {PART_LABELS[part]}
              </span>
              <span className={cn("tabular-nums", over ? "font-semibold text-destructive" : "text-muted-foreground")}>
                {partPlannedLabel(planned, limit)}
              </span>
            </div>
            <UsageBar
              value={getUsageBarPercentage(getUsedPercentage(planned, limit))}
              tone={over ? "danger" : `part-${part}`}
            />
            {over && (
              <Alert variant="destructive" className="rounded-xl border-transparent bg-danger-soft px-4 py-3.5">
                <TriangleAlert />
                <AlertTitle>{OVER_BUDGET_TITLE}</AlertTitle>
                <AlertDescription>{partExcessMessage(part, getExcessCents(planned, limit))}.</AlertDescription>
              </Alert>
            )}
          </li>
        );
      })}
    </ul>
  );
}
