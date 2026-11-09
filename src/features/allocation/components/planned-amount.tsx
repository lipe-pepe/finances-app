"use client";
// Client Component: o valor planejado depende da porcentagem do slider em tempo real.

import { useAllocation } from "@/features/allocation/components/allocation-provider";
import { formatBrl } from "@/lib/money";
import { calculatePlannedCents, getSectionPercentage, type PlanningSection } from "@/lib/planning";

type PlannedAmountProps = {
  section: PlanningSection;
  revenueCents: number;
};

/** Porcentagem e valor planejado de uma seção (receita × porcentagem, FR-015). */
export function PlannedAmount({ section, revenueCents }: PlannedAmountProps) {
  const { essentialPercentage } = useAllocation();
  const percentage = getSectionPercentage(section, essentialPercentage);
  const plannedCents = calculatePlannedCents(revenueCents, percentage);

  return (
    <p className="text-sm text-muted-foreground" data-testid={`planned-${section}`}>
      Planejado ({percentage}% da receita):{" "}
      <span className="font-medium text-foreground tabular-nums">{formatBrl(plannedCents)}</span>
    </p>
  );
}
