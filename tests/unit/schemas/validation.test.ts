import { describe, expect, it } from "vitest";
import { z } from "zod";
import { amountSchema, nameSchema } from "@/lib/validation";
import { validationError } from "@/lib/action-result";

describe("nameSchema", () => {
  it("remove espaços nas pontas", () => {
    expect(nameSchema.parse("  Salário  ")).toBe("Salário");
  });

  it("exige nome não vazio", () => {
    expect(nameSchema.safeParse("   ").success).toBe(false);
  });

  it("aceita até 100 caracteres", () => {
    expect(nameSchema.safeParse("a".repeat(100)).success).toBe(true);
    expect(nameSchema.safeParse("a".repeat(101)).success).toBe(false);
  });
});

describe("amountSchema", () => {
  it.each([
    ["1.250,50", 125050],
    ["1250.50", 125050],
    ["999.999.999,99", 99_999_999_999],
    ["0,01", 1],
  ])("converte %s em %i centavos", (input, cents) => {
    expect(amountSchema.parse(input)).toBe(cents);
  });

  it.each([
    ["", "Informe o valor."],
    ["0", "O valor deve ser maior que zero."],
    ["0,00", "O valor deve ser maior que zero."],
    ["-5", "Valor inválido. Use números com até 2 casas decimais (ex.: 1.234,56)."],
    ["1,234", "Valor inválido. Use números com até 2 casas decimais (ex.: 1.234,56)."],
    ["abc", "Valor inválido. Use números com até 2 casas decimais (ex.: 1.234,56)."],
    ["1.000.000.000,00", "O valor máximo é R$ 999.999.999,99."],
  ])("rejeita %j", (input, message) => {
    const result = amountSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(message);
  });
});

describe("validationError", () => {
  it("agrupa as mensagens por campo", () => {
    const schema = z.object({ name: nameSchema, amount: amountSchema });
    const result = schema.safeParse({ name: "", amount: "0" });
    expect(result.success).toBe(false);
    const error = validationError(result.error!);
    expect(error).toEqual({
      ok: false,
      error: {
        code: "VALIDATION",
        fieldErrors: {
          name: ["Informe o nome."],
          amount: ["O valor deve ser maior que zero."],
        },
      },
    });
  });
});
