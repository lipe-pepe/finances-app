import { describe, expect, it } from "vitest";
import {
  ALL_CATEGORIES,
  buildCumulativeSeries,
  filterActualExpenses,
  getAvailableCents,
  getUsageBarPercentage,
  getUsedPercentage,
  isOverLimit,
  sumActualCents,
} from "@/lib/spending";

function item(id: string, categoryId: string, amountCents: number, spentOn: string) {
  return { id, name: id, amountCents, categoryId, categoryName: categoryId, spentOn };
}

describe("spending", () => {
  it("usa 'all' para todas as categorias", () => {
    expect(ALL_CATEGORIES).toBe("all");
  });

  it("filtra os gastos da seleção mantendo a ordem", () => {
    const items = [
      item("a", "moradia", 1, "2026-11-09"),
      item("b", "alimentacao", 2, "2026-11-08"),
      item("c", "moradia", 3, "2026-11-01"),
    ];
    expect(filterActualExpenses(items, { category: "all", part: null })).toEqual(items);
    expect(filterActualExpenses(items, { category: "moradia", part: null }).map((i) => i.id)).toEqual([
      "a",
      "c",
    ]);
  });

  it("filtra por parte e por categoria juntas (feature 006, FR-028)", () => {
    const items = [
      { ...item("a", "moradia", 1, "2026-11-09"), part: "essentials" as const },
      { ...item("b", "alimentacao", 2, "2026-11-08"), part: "education" as const },
      { ...item("c", "moradia", 3, "2026-11-01"), part: "education" as const },
    ];
    expect(filterActualExpenses(items, { category: "all", part: "education" }).map((i) => i.id)).toEqual([
      "b",
      "c",
    ]);
    expect(filterActualExpenses(items, { category: "moradia", part: "education" }).map((i) => i.id)).toEqual([
      "c",
    ]);
    expect(filterActualExpenses(items, { category: "moradia", part: "free" })).toEqual([]);
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

  it("calcula o percentual usado do planejado", () => {
    expect(getUsedPercentage(75000, 150000)).toBe(50);
    expect(getUsedPercentage(160500, 150000)).toBe(107);
    expect(getUsedPercentage(0, 0)).toBe(0);
    expect(getUsedPercentage(100, 0)).toBeNull();
    expect(getUsedPercentage(1, 3)).toBe(33);
  });

  it("limita a barra de uso a 100% e enche quando o percentual é indefinido", () => {
    expect(getUsageBarPercentage(50)).toBe(50);
    expect(getUsageBarPercentage(107)).toBe(100);
    expect(getUsageBarPercentage(null)).toBe(100);
  });
});
