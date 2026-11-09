import { describe, expect, it } from "vitest";
import { formatBrl, parseBrlToCents } from "@/lib/money";
import {
  DEFAULT_ESSENTIAL_PERCENTAGE,
  calculatePlannedCents,
  getGoalsPercentage,
  isOverBudget,
  sumCents,
} from "@/lib/planning";

// Teste unitário rastreável à spec specs/001-financial-planning/spec.md (Princípio II).
// Cada describe referencia um cenário de aceitação ou caso de borda da spec.

/** Converte valores em reais (texto) para centavos, falhando se algum for inválido. */
function cents(...values: string[]): number[] {
  return values.map((value) => {
    const result = parseBrlToCents(value);
    if (result === null) throw new Error(`Valor inválido no teste: ${value}`);
    return result;
  });
}

describe("Spec 001 — US2: receita total é a soma dos ganhos", () => {
  it("cenários 1 e 2: R$ 5.000,00 + R$ 1.250,50 = R$ 6.250,50", () => {
    expect(formatBrl(sumCents(cents("5.000,00")))).toBe("R$ 5.000,00");
    expect(formatBrl(sumCents(cents("5.000,00", "1.250,50")))).toBe("R$ 6.250,50");
  });
});

describe("Spec 001 — US3: divisão da receita pelo slider", () => {
  it("cenário 1: receita R$ 6.000,00 a 70% → R$ 4.200,00 / R$ 1.800,00", () => {
    const [revenue] = cents("6.000,00");
    expect(formatBrl(calculatePlannedCents(revenue, 70))).toBe("R$ 4.200,00");
    expect(formatBrl(calculatePlannedCents(revenue, getGoalsPercentage(70)))).toBe("R$ 1.800,00");
  });

  it("cenário 3 / FR-017: a divisão padrão é 50% / 50%", () => {
    expect(DEFAULT_ESSENTIAL_PERCENTAGE).toBe(50);
    expect(getGoalsPercentage(DEFAULT_ESSENTIAL_PERCENTAGE)).toBe(50);
  });

  it("FR-013: as duas porcentagens sempre somam 100%", () => {
    for (let percentage = 0; percentage <= 100; percentage++) {
      expect(percentage + getGoalsPercentage(percentage)).toBe(100);
    }
  });
});

describe("Spec 001 — US4: soma dos gastos essenciais", () => {
  it("cenário 4: R$ 1.500,00 + R$ 450,75 = R$ 1.950,75", () => {
    expect(formatBrl(sumCents(cents("1.500,00", "450,75")))).toBe("R$ 1.950,75");
  });
});

describe("Spec 001 — US5: soma das metas futuras", () => {
  it("cenário 3: R$ 500,00 + R$ 300,00 = R$ 800,00", () => {
    expect(formatBrl(sumCents(cents("500,00", "300,00")))).toBe("R$ 800,00");
  });
});

describe("Spec 001 — US6: alerta de planejamento excedido", () => {
  const [revenue] = cents("4.000,00");
  const planned = calculatePlannedCents(revenue, 50);

  it("cenário 1: gastos de R$ 2.100,00 com R$ 2.000,00 planejado → alerta", () => {
    expect(isOverBudget(sumCents(cents("2.100,00")), planned)).toBe(true);
  });

  it("cenário 2: gastos de exatamente R$ 2.000,00 → sem alerta", () => {
    expect(isOverBudget(sumCents(cents("2.000,00")), planned)).toBe(false);
  });
});

describe("Spec 001 — casos de borda", () => {
  it("somas com centavos são exatas: R$ 0,10 + R$ 0,20 = R$ 0,30", () => {
    expect(formatBrl(sumCents(cents("0,10", "0,20")))).toBe("R$ 0,30");
  });

  it("valor planejado com fração de centavo é arredondado: 33% de R$ 100,01 = R$ 33,00", () => {
    const [revenue] = cents("100,01");
    expect(formatBrl(calculatePlannedCents(revenue, 33))).toBe("R$ 33,00");
  });

  it("receita zero: planejado R$ 0,00 e qualquer valor maior que zero dispara o alerta", () => {
    const plannedWithoutRevenue = calculatePlannedCents(0, 50);
    expect(plannedWithoutRevenue).toBe(0);
    expect(isOverBudget(sumCents(cents("0,01")), plannedWithoutRevenue)).toBe(true);
  });

  it("slider nos extremos: uma das seções tem planejado R$ 0,00", () => {
    const [revenue] = cents("4.000,00");
    expect(calculatePlannedCents(revenue, getGoalsPercentage(100))).toBe(0);
    expect(calculatePlannedCents(revenue, 0)).toBe(0);
  });

  it("valores muito altos não perdem precisão: R$ 999.999.999,99", () => {
    expect(formatBrl(sumCents(cents("999.999.999,99")))).toBe("R$ 999.999.999,99");
  });

  it("valores inválidos são rejeitados (mais de 2 casas, negativos, não numéricos)", () => {
    for (const value of ["1,234", "-1", "abc"]) {
      expect(parseBrlToCents(value)).toBeNull();
    }
  });
});
