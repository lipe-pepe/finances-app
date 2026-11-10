import { describe, expect, it } from "vitest";
import {
  SECTION_LABELS,
  SECTION_TOTAL_LABELS,
  TAB_ALERT_SR_TEXT,
  TAB_LABELS,
  PLANNING_SUBTITLE,
  incomeCountLabel,
  overBudgetMessage,
} from "@/lib/planning-labels";

describe("planning-labels", () => {
  it("nomeia as seções como Momento Presente e Momento Futuro", () => {
    expect(SECTION_LABELS).toEqual({ expenses: "Momento Presente", goals: "Momento Futuro" });
  });

  it("nomeia os totais das seções", () => {
    expect(SECTION_TOTAL_LABELS).toEqual({
      expenses: "Total do Momento Presente",
      goals: "Total do Momento Futuro",
    });
  });

  it("monta a mensagem de alerta com o valor excedido", () => {
    expect(overBudgetMessage("expenses", 10000)).toBe(
      "O Momento Presente excede o planejado em R$ 100,00",
    );
    expect(overBudgetMessage("goals", 1)).toBe("O Momento Futuro excede o planejado em R$ 0,01");
  });

  it("nomeia as abas e o texto acessível do indicador", () => {
    expect(TAB_LABELS).toEqual({
      income: "Receita",
      present: "Momento Presente",
      future: "Momento Futuro",
    });
    expect(TAB_ALERT_SR_TEXT).toBe(", com alerta");
  });

  it("não usa mais os nomes antigos", () => {
    const texts = [
      ...Object.values(SECTION_LABELS),
      ...Object.values(SECTION_TOTAL_LABELS),
      ...Object.values(TAB_LABELS),
      overBudgetMessage("expenses", 1),
      overBudgetMessage("goals", 1),
    ].join(" ");
    expect(texts).not.toMatch(/gastos essenciais|metas futuras/i);
  });

  it("conta os ganhos cadastrados no singular e no plural", () => {
    expect(incomeCountLabel(0)).toBe("Nenhum ganho cadastrado");
    expect(incomeCountLabel(1)).toBe("1 ganho cadastrado");
    expect(incomeCountLabel(2)).toBe("2 ganhos cadastrados");
  });

  it("define a frase de apoio do Planejamento", () => {
    expect(PLANNING_SUBTITLE).toBe(
      "Defina sua receita e divida entre o Momento Presente e o Momento Futuro.",
    );
  });
});
