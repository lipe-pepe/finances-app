import { describe, expect, it } from "vitest";
import {
  PART_FIELD_LABEL,
  PART_SELECT_LABEL,
  partEmptyMessage,
  partOptionLabel,
  partTotalLabel,
  PART_LABELS,
  PRESENT_ZERO_HINT,
  partChartSummary,
  partExcessMessage,
  partPercentLabel,
  partPlannedLabel,
  partSplitValueText,
  partToggleLabel,
  presentTotalLabel,
  thumbLabel,
} from "@/lib/part-labels";

describe("part-labels", () => {
  it("nomeia as partes", () => {
    expect(PART_LABELS).toEqual({
      essentials: "Gastos Essenciais",
      education: "Educação",
      free: "Livre",
    });
    expect(PART_FIELD_LABEL).toBe("Parte");
  });

  it("monta os textos da divisão", () => {
    expect(partPercentLabel("education", 5)).toBe("Educação · 5% da Receita");
    expect(presentTotalLabel(70, 700000)).toBe("70% da Receita · R$ 7.000,00");
    expect(thumbLabel("essentials", "education")).toBe("Divisão entre Gastos Essenciais e Educação");
    expect(partSplitValueText({ essentials: 60, education: 5 })).toBe("Gastos Essenciais 60%, Educação 5%");
    expect(PRESENT_ZERO_HINT).toBe("Defina a porcentagem do Momento Presente na aba Receita.");
  });

  it("monta os textos de planejado e excesso", () => {
    expect(partPlannedLabel(40000, 50000)).toBe("Planejado R$ 400,00 de R$ 500,00");
    expect(partExcessMessage("education", 10000)).toBe("Educação excede o valor da parte em R$ 100,00");
  });

  it("monta o resumo do gráfico e o nome do botão da legenda", () => {
    expect(partChartSummary({ part: "essentials", spentCents: 120000, limitCents: 600000 })).toBe(
      "Gastos Essenciais: gasto acumulado de R$ 1.200,00 de um limite de R$ 6.000,00.",
    );
    expect(partChartSummary({ part: "free", spentCents: 60000, limitCents: 50000 })).toBe(
      "Livre: gasto acumulado de R$ 600,00 de um limite de R$ 500,00. Acima do limite.",
    );
    expect(partToggleLabel("education", 5, 10000)).toBe("Educação, 5% da Receita, gasto R$ 100,00");
  });

  it("monta os textos do seletor de parte, da lista vazia e do total (feature 007)", () => {
    expect(PART_SELECT_LABEL).toBe("Parte");
    expect(partOptionLabel("education", false)).toBe("Educação");
    expect(partOptionLabel("free", true)).toBe("Livre — excedida");
    expect(partEmptyMessage("education")).toBe("Nenhum gasto em Educação.");
    expect(partTotalLabel("essentials")).toBe("Total de Gastos Essenciais");
  });
});
