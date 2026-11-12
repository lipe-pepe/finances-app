import { describe, expect, it } from "vitest";
import { expenseSchema } from "@/features/expenses/schemas";

const CATEGORY_ID = "0b6f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59";

describe("expenseSchema", () => {
  it("aceita nome, valor, categoria e parte", () => {
    expect(
      expenseSchema.parse({ name: "Aluguel", amount: "1.500,00", categoryId: CATEGORY_ID, part: "essentials" }),
    ).toEqual({ name: "Aluguel", amount: 150000, categoryId: CATEGORY_ID, part: "essentials" });
  });

  it.each(["essentials", "education", "free"])("aceita a parte %s (feature 006)", (part) => {
    expect(
      expenseSchema.safeParse({ name: "Curso", amount: "10", categoryId: CATEGORY_ID, part }).success,
    ).toBe(true);
  });

  it("exige a parte (FR-011)", () => {
    const result = expenseSchema.safeParse({ name: "Curso", amount: "10", categoryId: CATEGORY_ID });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Selecione a parte.");
  });

  it("exige categoria (uuid obrigatório)", () => {
    const empty = expenseSchema.safeParse({ name: "Aluguel", amount: "10", categoryId: "" });
    expect(empty.success).toBe(false);
    expect(empty.error?.issues[0]?.message).toBe("Selecione uma categoria.");
    expect(
      expenseSchema.safeParse({ name: "Aluguel", amount: "10", categoryId: "x" }).success,
    ).toBe(false);
  });

  it("aplica as mesmas regras de nome e valor dos ganhos", () => {
    expect(
      expenseSchema.safeParse({ name: "", amount: "0", categoryId: CATEGORY_ID }).success,
    ).toBe(false);
  });
});
