"use client";
// Client Component: o alerta depende da porcentagem do slider em tempo real (FR-032), que só
// existe no navegador enquanto o usuário arrasta.

import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useOverBudget } from "@/features/planning/hooks/use-over-budget";
import { formatBrl } from "@/lib/money";
import type { PlanningSection } from "@/lib/planning";

type OverBudgetAlertProps = {
  section: PlanningSection;
  revenueCents: number;
  totalCents: number;
};

const SECTION_SUBJECT: Record<PlanningSection, string> = {
  expenses: "Os gastos essenciais excedem",
  goals: "As metas futuras excedem",
};

/** Alerta exibido quando a soma da seção é estritamente maior que o valor planejado. */
export function OverBudgetAlert({ section, revenueCents, totalCents }: OverBudgetAlertProps) {
  const { isOver, excessCents } = useOverBudget(section, revenueCents, totalCents);

  if (!isOver) {
    return null;
  }

  return (
    <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
      <TriangleAlert />
      <AlertTitle>Planejamento incorreto</AlertTitle>
      <AlertDescription>
        {SECTION_SUBJECT[section]} o planejado em {formatBrl(excessCents)}.
      </AlertDescription>
    </Alert>
  );
}
