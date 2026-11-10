import { describe, expect, it } from "vitest";
import {
  ALL_CATEGORIES,
  buildCumulativeSeries,
  filterActualExpenses,
  getAvailableCents,
  getPlannedCents,
  isOverLimit,
  sumActualCents,
} from "@/lib/spending";

function item(id: string, categoryId: string, amountCents: number, spentOn: string) {
  return { id, name: id, amountCents, categoryId, categoryName: categoryId, spentOn };
}

const PLANNED = { moradia: 150000, alimentacao: 80000 };

describe("spending", () => {
  it("usa 'all' para todas as categorias", () => {
    expect(ALL_CATEGORIES).toBe("all");
  });

  it("calcula o planejado da seleção", () => {
    expect(getPlannedCents(PLANNED, "all")).toBe(230000);
    expect(getPlannedCents(PLANNED, "moradia")).toBe(150000);
    expect(getPlannedCents(PLANNED, "sem-planejado")).toBe(0);
  });

  it("filtra os gastos da seleção mantendo a ordem", () => {
    const items = [
      item("a", "moradia", 1, "2026-11-09"),
      item("b", "alimentacao", 2, "2026-11-08"),
      item("c", "moradia", 3, "2026-11-01"),
    ];
    expect(filterActualExpenses(items, "all")).toEqual(items);
    expect(filterActualExpenses(items, "moradia").map((i) => i.id)).toEqual(["a", "c"]);
  });

  it("soma os gastos e calcula o disponível", () => {
    expect(sumActualCents([item("a", "x", 40000, "2026-11-02"), item("b", "x", 35000, "2026-11-05")])).toBe(75000);
    expect(getAvailableCents(150000, 75000)).toBe(75000);
    expect(getAvailableCents(150000, 160000)).toBe(-10000);
    expect(isOverLimit(-1)).toBe(true);
    expect(isOverLimit(0)).toBe(false);
  });

  it("monta o gasto acumulado por dia até hoje", () => {
    const series = buildCumulativeSeries(
      [item("b", "x", 35000, "2026-11-05"), item("a", "x", 40000, "2026-11-02")],
      "2026-11-09",
    );
    expect(series).toHaveLength(30);
    expect(series[0]).toEqual({ day: 1, spentCents: 0 });
    expect(series.slice(1, 4).map((p) => p.spentCents)).toEqual([40000, 40000, 40000]);
    expect(series.slice(4, 9).map((p) => p.spentCents)).toEqual(Array(5).fill(75000));
    expect(series.slice(9).every((p) => p.spentCents === null)).toBe(true);
    expect(series[29].day).toBe(30);
  });

  it("estende a série até um gasto com data futura dentro do mês", () => {
    const series = buildCumulativeSeries([item("a", "x", 1000, "2026-11-20")], "2026-11-09");
    expect(series[18].spentCents).toBe(0);
    expect(series[19].spentCents).toBe(1000);
    expect(series.slice(20).every((p) => p.spentCents === null)).toBe(true);
  });

  it("sem gastos, a série é zero até hoje", () => {
    const series = buildCumulativeSeries([], "2026-11-09");
    expect(series.slice(0, 9).every((p) => p.spentCents === 0)).toBe(true);
    expect(series.slice(9).every((p) => p.spentCents === null)).toBe(true);
  });
});
