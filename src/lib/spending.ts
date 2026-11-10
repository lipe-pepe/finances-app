import { getDayOfMonth, getDaysInMonth } from "@/lib/calendar";
import { sumCents } from "@/lib/planning";

// Regras do dashboard do Controle (funções puras, valores em centavos)

/** Seleção que considera todas as categorias juntas ("Todos"). */
export const ALL_CATEGORIES = "all";

/** "all" ou o id de uma categoria. */
export type CategorySelection = string;

/** Campos de um gasto realizado usados nos cálculos. */
type SpendingEntry = { amountCents: number; categoryId: string; spentOn: string };

export type SeriesPoint = {
  day: number;
  /** Gasto acumulado até o dia; null depois do último dia exibido */
  spentCents: number | null;
};

/** Planejado da seleção: soma dos gastos planejados da categoria, ou de todas (FR-015). */
export function getPlannedCents(
  plannedCentsByCategory: Record<string, number>,
  selection: CategorySelection,
): number {
  if (selection === ALL_CATEGORIES) {
    return sumCents(Object.values(plannedCentsByCategory));
  }
  return plannedCentsByCategory[selection] ?? 0;
}

/** Gastos da seleção, na mesma ordem recebida (FR-016). */
export function filterActualExpenses<T extends SpendingEntry>(
  items: T[],
  selection: CategorySelection,
): T[] {
  if (selection === ALL_CATEGORIES) return items;
  return items.filter((item) => item.categoryId === selection);
}

export function sumActualCents(items: SpendingEntry[]): number {
  return sumCents(items.map((item) => item.amountCents));
}

/** Disponível = planejado − gasto; pode ser negativo (FR-017). */
export function getAvailableCents(plannedCents: number, spentCents: number): number {
  return plannedCents - spentCents;
}

export function isOverLimit(availableCents: number): boolean {
  return availableCents < 0;
}

/**
 * Gasto acumulado por dia do mês de `today` (FR-018). A linha vai até o maior entre hoje e o dia
 * do último gasto (datas futuras dentro do mês são permitidas); os dias seguintes ficam null.
 */
export function buildCumulativeSeries(items: SpendingEntry[], today: string): SeriesPoint[] {
  const daysInMonth = getDaysInMonth(today);
  const spentByDay = new Array<number>(daysInMonth + 1).fill(0);
  let lastDay = getDayOfMonth(today);

  for (const item of items) {
    const day = getDayOfMonth(item.spentOn);
    spentByDay[day] += item.amountCents;
    lastDay = Math.max(lastDay, day);
  }

  const series: SeriesPoint[] = [];
  let accumulated = 0;
  for (let day = 1; day <= daysInMonth; day += 1) {
    accumulated += spentByDay[day];
    series.push({ day, spentCents: day <= lastDay ? accumulated : null });
  }
  return series;
}

/**
 * Percentual do planejado já usado, arredondado (FR-008). Planejado zero: 0% sem gasto e
 * indefinido (`null`) com gasto, pois não há base para a divisão.
 */
export function getUsedPercentage(spentCents: number, plannedCents: number): number | null {
  if (plannedCents <= 0) return spentCents > 0 ? null : 0;
  return Math.round((spentCents / plannedCents) * 100);
}

/** Preenchimento da barra de uso: limitado a 100%; indefinido = barra cheia. */
export function getUsageBarPercentage(usedPercentage: number | null): number {
  return usedPercentage === null ? 100 : Math.min(100, usedPercentage);
}
