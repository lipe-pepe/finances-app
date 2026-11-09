"use client";
// Hook de cliente: depende da porcentagem do slider em tempo real (contexto de alocação).

import { useAllocation } from "@/features/allocation/components/allocation-provider";
import {
  calculatePlannedCents,
  getExcessCents,
  getSectionPercentage,
  isOverBudget,
  type PlanningSection,
} from "@/lib/planning";

export type OverBudgetState = {
  isOver: boolean;
  plannedCents: number;
  excessCents: number;
};

/**
 * Regra de alerta de uma seção, compartilhada pelo alerta da seção e pelo indicador da aba,
 * para que os dois sempre concordem (SC-004a).
 */
export function useOverBudget(
  section: PlanningSection,
  revenueCents: number,
  totalCents: number,
): OverBudgetState {
  const { essentialPercentage } = useAllocation();
  const plannedCents = calculatePlannedCents(
    revenueCents,
    getSectionPercentage(section, essentialPercentage),
  );
  return {
    isOver: isOverBudget(totalCents, plannedCents),
    plannedCents,
    excessCents: getExcessCents(totalCents, plannedCents),
  };
}
