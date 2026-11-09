import { describe, expect, it } from "vitest";
import { incomeSchema } from "@/features/incomes/schemas";

describe("incomeSchema", () => {
  it("aceita nome e valor válidos, convertendo o valor para centavos", () => {
    expect(incomeSchema.parse({ name: " Salário ", amount: "5.000,00" })).toEqual({
      name: "Salário",
      amount: 500000,
    });
  });

  it("exige nome de 1 a 100 caracteres após trim", () => {
    expect(incomeSchema.safeParse({ name: "  ", amount: "10" }).success).toBe(false);
    expect(incomeSchema.safeParse({ name: "a".repeat(101), amount: "10" }).success).toBe(false);
  });

  it("exige valor > 0, com no máximo 2 casas decimais e até R$ 999.999.999,99", () => {
    expect(incomeSchema.safeParse({ name: "Salário", amount: "0" }).success).toBe(false);
    expect(incomeSchema.safeParse({ name: "Salário", amount: "10,123" }).success).toBe(false);
    expect(incomeSchema.safeParse({ name: "Salário", amount: "1.000.000.000" }).success).toBe(false);
    expect(incomeSchema.safeParse({ name: "Salário", amount: "999.999.999,99" }).success).toBe(true);
  });
});
