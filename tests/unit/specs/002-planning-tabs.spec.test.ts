import { describe, expect, it } from "vitest";
import { parseBrlToCents } from "@/lib/money";
import { calculatePlannedCents, getGoalsPercentage, isOverBudget } from "@/lib/planning";
import {
  SECTION_LABELS,
  SECTION_TOTAL_LABELS,
  TAB_LABELS,
  overBudgetMessage,
} from "@/lib/planning-labels";
import { PLANNING_TABS, buildPlanningTabUrl, parsePlanningTab } from "@/lib/planning-tab";

// Teste unitário rastreável à spec specs/002-planning-tabs/spec.md (Princípio II).

function cents(value: string): number {
  const result = parseBrlToCents(value);
  if (result === null) throw new Error(`Valor inválido no teste: ${value}`);
  return result;
}

describe("Spec 002 — US1: navegação por abas", () => {
  it("cenário 1 / FR-001: três abas na ordem Receita, Momento Presente, Momento Futuro", () => {
    expect(PLANNING_TABS.map((tab) => TAB_LABELS[tab])).toEqual([
      "Receita",
      "Momento Presente",
      "Momento Futuro",
    ]);
  });

  it("cenário 1 / FR-006: sem aba no endereço, abre em Receita", () => {
    expect(TAB_LABELS[parsePlanningTab(undefined)]).toBe("Receita");
  });

  it("cenários 7 e 8 / FR-006: a aba do endereço é respeitada ao recarregar ou abrir link", () => {
    expect(TAB_LABELS[parsePlanningTab("future")]).toBe("Momento Futuro");
    expect(TAB_LABELS[parsePlanningTab("present")]).toBe("Momento Presente");
  });

  it("edge case: aba inválida no endereço abre Receita", () => {
    expect(TAB_LABELS[parsePlanningTab("xyz")]).toBe("Receita");
  });

  it("FR-006a: o endereço da aba Receita é o endereço limpo", () => {
    expect(buildPlanningTabUrl("income")).toBe("/");
    expect(buildPlanningTabUrl(parsePlanningTab(buildPlanningTabUrl("future").split("=")[1]))).toBe(
      "/?tab=future",
    );
  });
});

describe("Spec 002 — US2: novos nomes", () => {
  it("cenário 1 / FR-010: slider em 70% → 'Momento Presente 70%' e 'Momento Futuro 30%'", () => {
    expect(`${SECTION_LABELS.expenses} 70%`).toBe("Momento Presente 70%");
    expect(`${SECTION_LABELS.goals} ${getGoalsPercentage(70)}%`).toBe("Momento Futuro 30%");
  });

  it("cenários 2 e 3 / FR-011: totais com os novos nomes", () => {
    expect(SECTION_TOTAL_LABELS.expenses).toBe("Total do Momento Presente");
    expect(SECTION_TOTAL_LABELS.goals).toBe("Total do Momento Futuro");
  });

  it("cenários 4 e 5 / FR-012: mensagens de alerta com os novos nomes", () => {
    expect(overBudgetMessage("expenses", cents("100,00"))).toBe(
      "O Momento Presente excede o planejado em R$ 100,00",
    );
    expect(overBudgetMessage("goals", cents("100,00"))).toBe(
      "O Momento Futuro excede o planejado em R$ 100,00",
    );
  });
});

describe("Spec 002 — US3: indicador de alerta na aba", () => {
  const revenue = cents("4.000,00");

  it("R$ 2.100,00 no Momento Presente com 50% → aba sinalizada", () => {
    expect(isOverBudget(cents("2.100,00"), calculatePlannedCents(revenue, 50))).toBe(true);
  });

  it("cenário 4: soma igual ao planejado (R$ 2.000,00) → sem indicador", () => {
    expect(isOverBudget(cents("2.000,00"), calculatePlannedCents(revenue, 50))).toBe(false);
  });

  it("cenário 2: mover o slider para 55% remove o indicador", () => {
    expect(isOverBudget(cents("2.100,00"), calculatePlannedCents(revenue, 55))).toBe(false);
  });
});
