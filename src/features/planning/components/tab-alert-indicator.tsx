"use client";
// Client Component: o indicador depende da porcentagem do slider em tempo real (FR-014a).

import { TriangleAlert } from "lucide-react";
import { useOverBudget } from "@/features/planning/hooks/use-over-budget";
import type { PlanningSection } from "@/lib/planning";
import { TAB_ALERT_SR_TEXT } from "@/lib/planning-labels";

type TabAlertIndicatorProps = {
  section: PlanningSection;
  revenueCents: number;
  totalCents: number;
};

/**
 * Indicador de planejamento excedido exibido no nome da aba (FR-014). O ícone é decorativo; o
 * texto oculto faz leitores de tela anunciarem a aba como "..., com alerta" (FR-014b).
 */
export function TabAlertIndicator({ section, revenueCents, totalCents }: TabAlertIndicatorProps) {
  const { isOver } = useOverBudget(section, revenueCents, totalCents);

  if (!isOver) {
    return null;
  }

  return (
    <>
      <TriangleAlert aria-hidden="true" className="size-4 text-destructive" />
      <span className="sr-only">{TAB_ALERT_SR_TEXT}</span>
    </>
  );
}
