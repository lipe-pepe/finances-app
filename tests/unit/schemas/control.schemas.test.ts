import { describe, expect, it } from "vitest";
import { createActualExpenseSchema } from "@/features/control/schemas";

const CATEGORY_ID = "0b6f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59";
const TODAY = "2026-11-09";

function errorsFor(input: Record<string, unknown>, today = TODAY) {
  const result = createActualExpenseSchema(today).safeParse(input);
  if (result.success) return {};
  return result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
}

const VALID = {
  name: " Mercado ",
  amount: "230,50",
  categoryId: CATEGORY_ID,
  spentOn: TODAY,
  part: "essentials",
};

describe("createActualExpenseSchema", () => {
  it("aceita um gasto válido e converte o valor para centavos", () => {
    expect(createActualExpenseSchema(TODAY).parse(VALID)).toEqual({
      name: "Mercado",
      amount: 23050,
      categoryId: CATEGORY_ID,
      spentOn: TODAY,
      part: "essentials",
    });
  });

  it.each(["2026-11-01", "2026-11-30"])("aceita %s, dentro do mês atual", (spentOn) => {
    expect(createActualExpenseSchema(TODAY).safeParse({ ...VALID, spentOn }).success).toBe(true);
  });

  it("exige a data", () => {
    expect(errorsFor({ ...VALID, spentOn: "", part: "essentials" }).spentOn).toEqual(["Informe a data."]);
  });

  it.each(["2026-02-30", "09/11/2026"])("recusa a data inválida %s", (spentOn) => {
    expect(errorsFor({ ...VALID, spentOn }).spentOn).toEqual(["Data inválida."]);
  });

  it.each(["2026-10-31", "2026-12-01"])("recusa %s, fora do mês atual", (spentOn) => {
    expect(errorsFor({ ...VALID, spentOn }).spentOn).toEqual([
      "A data deve estar dentro do mês atual.",
    ]);
  });

  it("usa as mesmas mensagens dos gastos planejados para nome, valor e categoria", () => {
    const errors = errorsFor({ name: "", amount: "0", categoryId: "", spentOn: TODAY });
    expect(errors.name).toEqual(["Informe o nome."]);
    expect(errors.amount).toEqual(["O valor deve ser maior que zero."]);
    expect(errors.categoryId).toEqual(["Selecione uma categoria."]);
  });

  it("considera o mês do dia informado como atual", () => {
    const schema = createActualExpenseSchema("2026-12-05");
    expect(schema.safeParse({ ...VALID, spentOn: "2026-12-01", part: "essentials" }).success).toBe(true);
    expect(schema.safeParse({ ...VALID, spentOn: "2026-11-30", part: "essentials" }).success).toBe(false);
  });

  it.each(["essentials", "education", "free"])("aceita a parte %s (feature 006)", (part) => {
    expect(createActualExpenseSchema(TODAY).safeParse({ ...VALID, part }).success).toBe(true);
  });

  it("exige a parte (FR-015)", () => {
    const { part: _part, ...withoutPart } = VALID;
    void _part;
    expect(errorsFor(withoutPart).part).toEqual(["Selecione a parte."]);
  });
});
