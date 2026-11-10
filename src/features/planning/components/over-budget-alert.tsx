"use client";
// Client Component: o alerta depende da porcentagem do slider em tempo real (FR-032), que só
// existe no navegador enquanto o usuário arrasta.

import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useOverBudget } from "@/features/planning/hooks/use-over-budget";
import type { PlanningSection } from "@/lib/planning";
import { OVER_BUDGET_TITLE, overBudgetMessage } from "@/lib/planning-labels";

type OverBudgetAlertProps = {
  section: PlanningSection;
  revenueCents: number;
  totalCents: number;
};

/** Alerta exibido quando a soma da seção é estritamente maior que o valor planejado. */
export function OverBudgetAlert({ section, revenueCents, totalCents }: OverBudgetAlertProps) {
  const { isOver, excessCents } = useOverBudget(section, revenueCents, totalCents);

  if (!isOver) {
    return null;
  }

  return (
    <Alert variant="destructive" className="rounded-xl border-transparent bg-danger-soft px-4 py-3.5">
      <TriangleAlert />
      <AlertTitle>{OVER_BUDGET_TITLE}</AlertTitle>
      <AlertDescription>
        {overBudgetMessage(section, excessCents)}.
      </AlertDescription>
    </Alert>
  );
}
