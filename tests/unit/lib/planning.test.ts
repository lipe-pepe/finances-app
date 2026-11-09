import { describe, expect, it } from "vitest";
import {
  DEFAULT_ESSENTIAL_PERCENTAGE,
  calculatePlannedCents,
  getExcessCents,
  getGoalsPercentage,
  getSectionPercentage,
  isOverBudget,
  sumCents,
} from "@/lib/planning";

describe("planning", () => {
  it("usa 50% como divisão padrão", () => {
    expect(DEFAULT_ESSENTIAL_PERCENTAGE).toBe(50);
  });

  it("soma valores em centavos", () => {
    expect(sumCents([])).toBe(0);
    expect(sumCents([150000, 45075])).toBe(195075);
  });

  it("calcula o valor planejado arredondado ao centavo", () => {
    expect(calculatePlannedCents(600000, 70)).toBe(420000);
    expect(calculatePlannedCents(600000, 30)).toBe(180000);
    expect(calculatePlannedCents(10001, 33)).toBe(3300);
    expect(calculatePlannedCents(0, 50)).toBe(0);
    expect(calculatePlannedCents(400000, 100)).toBe(400000);
    expect(calculatePlannedCents(400000, 0)).toBe(0);
  });

  it("calcula a porcentagem de metas futuras como complemento", () => {
    expect(getGoalsPercentage(70)).toBe(30);
    expect(getGoalsPercentage(0)).toBe(100);
    expect(getSectionPercentage("expenses", 70)).toBe(70);
    expect(getSectionPercentage("goals", 70)).toBe(30);
  });

  it("só considera excedido quando a soma é estritamente maior que o planejado", () => {
    expect(isOverBudget(200000, 200000)).toBe(false);
    expect(isOverBudget(210000, 200000)).toBe(true);
    expect(isOverBudget(1, 0)).toBe(true);
    expect(isOverBudget(0, 0)).toBe(false);
  });

  it("calcula o valor excedido", () => {
    expect(getExcessCents(210000, 200000)).toBe(10000);
    expect(getExcessCents(190000, 200000)).toBe(0);
  });
});
