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
  planned: "Planejado",
  spent: "Gasto",
  available: "Disponível",
  used: "Usado",
} as const;

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

/** Ex.: "Controle de Novembro de 2026". */
export function controlTitle(monthLabel: string): string {
  return `Controle de ${monthLabel}`;
}

/** Mensagem do disponível negativo; recebe o excesso (positivo) em centavos. */
export function overLimitMessage(excessCents: number): string {
  return `Acima do limite em ${formatBrl(excessCents)}`;
}

/** Alternativa textual ao gráfico, para leitores de tela (FR-019). */
export function chartSummary(input: {
  spentCents: number;
  plannedCents: number;
  monthLabel: string;
}): string {
  return `Gasto acumulado de ${formatBrl(input.spentCents)} de um limite de ${formatBrl(
    input.plannedCents,
  )} em ${input.monthLabel}`;
}
