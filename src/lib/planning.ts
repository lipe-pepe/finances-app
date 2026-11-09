// Regras de cálculo do planejamento (funções puras, valores em centavos inteiros).

export type PlanningSection = "expenses" | "goals";

/** Divisão usada quando o usuário nunca ajustou o slider (FR-017). */
export const DEFAULT_ESSENTIAL_PERCENTAGE = 50;

export function sumCents(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/** Valor planejado = receita × porcentagem, arredondado ao centavo mais próximo. */
export function calculatePlannedCents(revenueCents: number, percentage: number): number {
  return Math.round((revenueCents * percentage) / 100);
}

/** Porcentagem do Momento Futuro: complemento até 100%. */
export function getGoalsPercentage(essentialPercentage: number): number {
  return 100 - essentialPercentage;
}

/** Porcentagem da seção a partir da porcentagem do Momento Presente no slider. */
export function getSectionPercentage(section: PlanningSection, essentialPercentage: number): number {
  return section === "expenses" ? essentialPercentage : getGoalsPercentage(essentialPercentage);
}

/** O planejamento está incorreto quando a soma é estritamente maior que o planejado. */
export function isOverBudget(totalCents: number, plannedCents: number): boolean {
  return totalCents > plannedCents;
}

export function getExcessCents(totalCents: number, plannedCents: number): number {
  return Math.max(0, totalCents - plannedCents);
}
