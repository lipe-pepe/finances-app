import { formatBrl } from "@/lib/money";
import type { PresentPart } from "@/lib/present-parts";

// Nomes e textos das partes do Momento Presente (specs/006-present-moment-parts/contracts/ui.md)

export const PART_LABELS: Record<PresentPart, string> = {
  essentials: "Gastos Essenciais",
  education: "Educação",
  free: "Livre",
};

export const PART_FIELD_LABEL = "Parte";

export const PRESENT_ZERO_HINT = "Defina a porcentagem do Momento Presente na aba Receita.";

/** Tooltip da barra de uso. Ex.: "Educação · 5% da Receita". */
export function partPercentLabel(part: PresentPart, percentage: number): string {
  return `${PART_LABELS[part]} · ${percentage}% da Receita`;
}

/** Total do Momento Presente na aba. Ex.: "70% da Receita · R$ 7.000,00". */
export function presentTotalLabel(percentage: number, cents: number): string {
  return `${percentage}% da Receita · ${formatBrl(cents)}`;
}

/** Nome acessível de uma divisão do slider. */
export function thumbLabel(left: PresentPart, right: PresentPart): string {
  return `Divisão entre ${PART_LABELS[left]} e ${PART_LABELS[right]}`;
}

/** Valor anunciado de uma divisão do slider. Ex.: "Gastos Essenciais 60%, Educação 5%". */
export function partSplitValueText(values: Partial<Record<PresentPart, number>>): string {
  return Object.entries(values)
    .map(([part, percentage]) => `${PART_LABELS[part as PresentPart]} ${percentage}%`)
    .join(", ");
}

/** Planejado da parte em relação ao seu valor. */
export function partPlannedLabel(plannedCents: number, limitCents: number): string {
  return `Planejado ${formatBrl(plannedCents)} de ${formatBrl(limitCents)}`;
}

/** Alerta de parte excedida (FR-014). */
export function partExcessMessage(part: PresentPart, excessCents: number): string {
  return `${PART_LABELS[part]} excede o valor da parte em ${formatBrl(excessCents)}`;
}

/** Frase do resumo textual do gráfico para uma parte (FR-020). */
export function partChartSummary(input: {
  part: PresentPart;
  spentCents: number;
  limitCents: number;
}): string {
  const base = `${PART_LABELS[input.part]}: gasto acumulado de ${formatBrl(input.spentCents)} de um limite de ${formatBrl(input.limitCents)}.`;
  return input.spentCents > input.limitCents ? `${base} Acima do limite.` : base;
}

/** Nome acessível do botão da legenda da barra de uso. */
export function partToggleLabel(part: PresentPart, percentage: number, spentCents: number): string {
  return `${PART_LABELS[part]}, ${percentage}% da Receita, gasto ${formatBrl(spentCents)}`;
}
