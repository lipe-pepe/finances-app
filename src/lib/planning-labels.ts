import { usedLabel } from "@/lib/control-labels";
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

/** Frase de apoio abaixo do título da página Planejamento. */
export const PLANNING_SUBTITLE =
  "Defina sua receita e divida entre o Momento Presente e o Momento Futuro.";

/** Ex.: "Nenhum ganho cadastrado", "1 ganho cadastrado", "2 ganhos cadastrados". */
export function incomeCountLabel(count: number): string {
  if (count === 0) return "Nenhum ganho cadastrado";
  return count === 1 ? "1 ganho cadastrado" : `${count} ganhos cadastrados`;
}

/** Resumo do card de um momento. Ex.: "50% da receita · gastos R$ 2.750,00 (88%)". */
export function momentSummary(
  section: PlanningSection,
  percentage: number,
  totalCents: number,
  usedPercentage: number | null,
): string {
  const items = section === "expenses" ? "gastos" : "metas";
  return `${percentage}% da receita · ${items} ${formatBrl(totalCents)} (${usedLabel(usedPercentage)})`;
}
