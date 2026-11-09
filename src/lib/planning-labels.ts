import { formatBrl } from "@/lib/money";
import type { PlanningSection } from "@/lib/planning";
import type { PlanningTab } from "@/lib/planning-tab";

// Textos da interface do planejamento (FR-009 a FR-012). Os domínios internos continuam
// "expenses" e "goals"; apenas os nomes exibidos mudam.

export const SECTION_LABELS: Record<PlanningSection, string> = {
  expenses: "Momento Presente",
  goals: "Momento Futuro",
};

export const SECTION_TOTAL_LABELS: Record<PlanningSection, string> = {
  expenses: "Total do Momento Presente",
  goals: "Total do Momento Futuro",
};

export const TAB_LABELS: Record<PlanningTab, string> = {
  income: "Receita",
  present: SECTION_LABELS.expenses,
  future: SECTION_LABELS.goals,
};

/** Texto lido por leitores de tela junto ao nome da aba quando há alerta (FR-014b). */
export const TAB_ALERT_SR_TEXT = ", com alerta";

export const OVER_BUDGET_TITLE = "Planejamento incorreto";

/** Ex.: "O Momento Presente excede o planejado em R$ 100,00". */
export function overBudgetMessage(section: PlanningSection, excessCents: number): string {
  return `O ${SECTION_LABELS[section]} excede o planejado em ${formatBrl(excessCents)}`;
}
