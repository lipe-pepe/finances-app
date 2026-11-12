import { describe, expect, it } from "vitest";
import { createActualExpenseSchema } from "@/features/control/schemas";
import { HOME_PATH, resolveAuthRedirect } from "@/lib/auth-redirect";
import { getToday } from "@/lib/calendar";
import { overLimitMessage } from "@/lib/control-labels";
import { parseBrlToCents } from "@/lib/money";
import { buildPlanningTabUrl } from "@/lib/planning-tab";
import {
  ALL_CATEGORIES,
  buildCumulativeSeries,
  getAvailableCents,
  getPlannedCents,
  isOverLimit,
} from "@/lib/spending";

// Teste unitário rastreável à spec specs/003-spending-control/spec.md (Princípio II).

function cents(value: string): number {
  const result = parseBrlToCents(value);
  if (result === null) throw new Error(`Valor inválido no teste: ${value}`);
  return result;
}

const CATEGORY_ID = "0b6f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59";

describe("Spec 003 — US1: Planejamento e Controle", () => {
  it("cenários 1 e 5 / FR-003: página inicial e login levam ao Controle", () => {
    expect(HOME_PATH).toBe("/control");
    expect(resolveAuthRedirect("/", true)).toBe("/control");
    expect(resolveAuthRedirect("/login", true)).toBe("/control");
  });

  it("cenário 6 / FR-005: Planejamento e Controle exigem login", () => {
    expect(resolveAuthRedirect("/planning", false)).toBe("/login");
    expect(resolveAuthRedirect("/control", false)).toBe("/login");
  });

  it("cenário 3 / FR-004: as abas ficam no endereço da página Planejamento", () => {
    expect(buildPlanningTabUrl("income")).toBe("/planning");
    expect(buildPlanningTabUrl("future")).toBe("/planning?tab=future");
  });
});

describe("Spec 003 — US2: registrar um gasto realizado", () => {
  const schema = createActualExpenseSchema("2026-11-09");
  const base = { name: "Mercado", amount: "230,50", categoryId: CATEGORY_ID };

  it("cenário 2 / FR-006–FR-009: gasto com a data de hoje é aceito", () => {
    expect(schema.parse({ ...base, spentOn: "2026-11-09", part: "essentials" as const }).amount).toBe(cents("230,50"));
  });

  it("FR-009: o dia de hoje segue o fuso de Brasília", () => {
    expect(getToday(new Date("2026-11-10T02:59:59Z"))).toBe("2026-11-09");
  });

  it("cenário 3 / FR-009: data fora do mês atual é recusada", () => {
    for (const spentOn of ["2026-10-31", "2026-12-01"]) {
      const result = schema.safeParse({ ...base, spentOn });
      expect(result.success).toBe(false);
    }
  });

  it("cenário 3 / FR-007: valor zero é recusado", () => {
    expect(schema.safeParse({ ...base, amount: "0", spentOn: "2026-11-09", part: "essentials" as const }).success).toBe(false);
  });
});

describe("Spec 003 — US3: planejado × gasto por categoria", () => {
  const planned = { moradia: cents("1.500,00"), alimentacao: cents("800,00") };

  it("cenários 2 e 2a / FR-015: planejado por categoria e de Todos (metas não entram)", () => {
    expect(getPlannedCents(planned, "moradia")).toBe(cents("1.500,00"));
    expect(getPlannedCents(planned, ALL_CATEGORIES)).toBe(cents("2.300,00"));
  });

  it("cenário 4 / FR-017: disponível = planejado − gastos", () => {
    const spent = cents("400,00") + cents("350,00");
    expect(getAvailableCents(cents("1.500,00"), spent)).toBe(cents("750,00"));
  });

  it("cenário 5 / FR-017: disponível negativo é destacado como acima do limite", () => {
    const available = getAvailableCents(cents("1.500,00"), cents("1.600,00"));
    expect(isOverLimit(available)).toBe(true);
    expect(overLimitMessage(-available)).toBe("Acima do limite em R$ 100,00");
  });

  it("cenário 6 / FR-018: gráfico acumula o gasto dia a dia ao longo do mês", () => {
    const entry = (amount: string, spentOn: string) => ({
      amountCents: cents(amount),
      categoryId: "moradia",
      spentOn,
    });
    const series = buildCumulativeSeries(
      [entry("400,00", "2026-11-02"), entry("350,00", "2026-11-05")],
      "2026-11-09",
    );
    expect(series).toHaveLength(30);
    expect(series[4].spentCents).toBe(cents("750,00"));
    expect(series[9].spentCents).toBeNull();
  });

  it("cenário 7: categoria sem gastos tem disponível igual ao planejado", () => {
    expect(getAvailableCents(cents("1.500,00"), 0)).toBe(cents("1.500,00"));
  });
});
