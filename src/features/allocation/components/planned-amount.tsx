"use client";
// Client Component: o valor planejado depende da porcentagem do slider em tempo real.

import { useAllocation } from "@/features/allocation/components/allocation-provider";
import { formatBrl } from "@/lib/money";
import { calculatePlannedCents, getSectionPercentage, type PlanningSection } from "@/lib/planning";
import { SECTION_LABELS } from "@/lib/planning-labels";

type PlannedAmountProps = {
  section: PlanningSection;
  revenueCents: number;
  /** Exibe o nome do momento (usado fora da seção, ex.: junto ao slider na aba Receita) */
  showSectionLabel?: boolean;
};

/** Porcentagem e valor planejado de uma seção (receita × porcentagem, FR-015). */
export function PlannedAmount({ section, revenueCents, showSectionLabel }: PlannedAmountProps) {
  const { essentialPercentage } = useAllocation();
  const percentage = getSectionPercentage(section, essentialPercentage);
  const amount = (
    <span className="font-medium text-foreground tabular-nums">
      {formatBrl(calculatePlannedCents(revenueCents, percentage))}
    </span>
  );

  return (
    <p className="text-sm text-muted-foreground" data-testid={`planned-${section}`}>
      {showSectionLabel ? (
        <>
          {SECTION_LABELS[section]}: {amount} ({percentage}% da receita)
        </>
      ) : (
        <>
          Planejado ({percentage}% da receita): {amount}
        </>
      )}
    </p>
  );
}
