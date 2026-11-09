import { PLANNING_PATH } from "@/lib/app-routes";

// Aba selecionada da página Planejamento, registrada no endereço como ?tab=<valor> (FR-006)

export const PLANNING_TABS = ["income", "present", "future"] as const;

export type PlanningTab = (typeof PLANNING_TABS)[number];

export const DEFAULT_PLANNING_TAB: PlanningTab = "income";

/** Nome do parâmetro de busca que guarda a aba. */
export const PLANNING_TAB_PARAM = "tab";

function isPlanningTab(value: string): value is PlanningTab {
  return (PLANNING_TABS as readonly string[]).includes(value);
}

/**
 * Converte o valor do endereço na aba selecionada. Valores ausentes, inválidos, com maiúsculas
 * diferentes ou repetidos (?tab=a&tab=b) abrem a aba Receita.
 */
export function parsePlanningTab(value: string | string[] | undefined): PlanningTab {
  if (typeof value === "string" && isPlanningTab(value)) {
    return value;
  }
  return DEFAULT_PLANNING_TAB;
}

/** Endereço da página Planejamento para a aba (a aba Receita usa o endereço limpo "/planning"). */
export function buildPlanningTabUrl(tab: PlanningTab): string {
  return tab === DEFAULT_PLANNING_TAB
    ? PLANNING_PATH
    : `${PLANNING_PATH}?${PLANNING_TAB_PARAM}=${tab}`;
}
