import type { AppSection } from "@/lib/app-routes";
import { formatBrl } from "@/lib/money";

// Textos da navegação e da página Controle, centralizados para os componentes e os testes

export const SECTION_NAV_LABELS: Record<AppSection, string> = {
  planning: "Planejamento",
  control: "Controle",
};

export const ALL_CATEGORIES_LABEL = "Todos";
export const EMPTY_ACTUAL_EXPENSES = "Nenhum gasto registrado";
export const DATE_OUT_OF_MONTH_MESSAGE = "A data deve estar dentro do mês atual.";
export const CHART_LIMIT_LABEL = "Limite";

export const SUMMARY_LABELS = {
  /** Valor da parte ativa ou de todo o Momento Presente (feature 006, FR-029) */
  limit: "Limite",
  spent: "Gasto",
  available: "Disponível",
  used: "Usado",
} as const;

export const MONTH_EXPENSES_TITLE = "Gastos do mês";
export const REGISTER_BUTTON_LABEL = "Registrar gasto";
export const REGISTER_SHEET_TITLE = "Registrar gasto";
export const EDIT_SHEET_TITLE = "Editar gasto";

/** Percentual usado; "—" quando indefinido (planejado zero com gasto). */
export function usedLabel(usedPercentage: number | null): string {
  return usedPercentage === null ? "—" : `${usedPercentage}%`;
}

/** Dica do campo de data. Ex.: "Somente dias de novembro de 2026." */
export function dateHint(monthLabel: string): string {
  return `Somente dias de ${monthLabel.charAt(0).toLowerCase()}${monthLabel.slice(1)}.`;
}

/** Mensagem do disponível negativo; recebe o excesso (positivo) em centavos. */
export function overLimitMessage(excessCents: number): string {
  return `Acima do limite em ${formatBrl(excessCents)}`;
}
