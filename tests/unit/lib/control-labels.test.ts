import { describe, expect, it } from "vitest";
import {
  ALL_CATEGORIES_LABEL,
  CHART_LIMIT_LABEL,
  DATE_OUT_OF_MONTH_MESSAGE,
  EMPTY_ACTUAL_EXPENSES,
  SECTION_NAV_LABELS,
  SUMMARY_LABELS,
  chartSummary,
  controlTitle,
  EDIT_SHEET_TITLE,
  REGISTER_BUTTON_LABEL,
  dateHint,
  overLimitMessage,
  usedLabel,
} from "@/lib/control-labels";

describe("control-labels", () => {
  it("define os rótulos da navegação e do dashboard", () => {
    expect(SECTION_NAV_LABELS).toEqual({ planning: "Planejamento", control: "Controle" });
    expect(ALL_CATEGORIES_LABEL).toBe("Todos");
    expect(EMPTY_ACTUAL_EXPENSES).toBe("Nenhum gasto registrado");
    expect(DATE_OUT_OF_MONTH_MESSAGE).toBe("A data deve estar dentro do mês atual.");
    expect(SUMMARY_LABELS).toEqual({
      planned: "Planejado",
      spent: "Gasto",
      available: "Disponível",
      used: "Usado",
    });
    expect(CHART_LIMIT_LABEL).toBe("Limite");
  });

  it("monta as mensagens com valores em reais", () => {
    expect(overLimitMessage(10000)).toBe("Acima do limite em R$ 100,00");
    expect(
      chartSummary({ spentCents: 23050, plannedCents: 230000, monthLabel: "Novembro de 2026" }),
    ).toBe("Gasto acumulado de R$ 230,50 de um limite de R$ 2.300,00 em Novembro de 2026");
    expect(controlTitle("Novembro de 2026")).toBe("Controle de Novembro de 2026");
  });

  it("define os textos novos do Controle", () => {
    expect(usedLabel(107)).toBe("107%");
    expect(usedLabel(null)).toBe("—");
    expect(REGISTER_BUTTON_LABEL).toBe("Registrar gasto");
    expect(EDIT_SHEET_TITLE).toBe("Editar gasto");
    expect(dateHint("Novembro de 2026")).toBe("Somente dias de novembro de 2026.");
  });
});
