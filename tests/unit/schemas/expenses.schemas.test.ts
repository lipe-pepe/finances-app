import { describe, expect, it } from "vitest";
import { expenseSchema } from "@/features/expenses/schemas";

const CATEGORY_ID = "0b6f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59";

describe("expenseSchema", () => {
  it("aceita nome, valor e categoria", () => {
    expect(
      expenseSchema.parse({ name: "Aluguel", amount: "1.500,00", categoryId: CATEGORY_ID }),
    ).toEqual({ name: "Aluguel", amount: 150000, categoryId: CATEGORY_ID });
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
