import { describe, expect, it } from "vitest";
import {
  MAX_AMOUNT_CENTS,
  centsToDecimalString,
  centsToInputString,
  decimalToCents,
  formatBrl,
  parseBrlToCents,
} from "@/lib/money";

describe("parseBrlToCents", () => {
  it.each([
    ["1.234,56", 123456],
    ["1234,56", 123456],
    ["1234.56", 123456],
    ["1234", 123400],
    ["1.250,5", 125050],
    ["0,10", 10],
    ["R$ 1.500,00", 150000],
    [" 450,75 ", 45075],
    ["999.999.999,99", 99_999_999_999],
    ["1.234", 123400],
  ])("converte %s em %i centavos", (input, expected) => {
    expect(parseBrlToCents(input)).toBe(expected);
  });

  it.each(["", "abc", "-1", "-10,00", "1,234", "1.234.56", "12,3a", "1,", ",50", "1..000"])(
    "rejeita %j",
    (input) => {
      expect(parseBrlToCents(input)).toBeNull();
    },
  );

  it("aceita zero sintaticamente (a regra de > 0 fica no schema)", () => {
    expect(parseBrlToCents("0")).toBe(0);
  });
});

describe("conversões", () => {
  it("centsToDecimalString gera o formato aceito pelo banco", () => {
    expect(centsToDecimalString(123456)).toBe("1234.56");
    expect(centsToDecimalString(5)).toBe("0.05");
    expect(centsToDecimalString(MAX_AMOUNT_CENTS)).toBe("999999999.99");
  });

  it("decimalToCents converte valores do banco sem erro de ponto flutuante", () => {
    expect(decimalToCents("1250.5")).toBe(125050);
    expect(decimalToCents("0.1")).toBe(10);
    expect(decimalToCents("999999999.99")).toBe(MAX_AMOUNT_CENTS);
    expect(decimalToCents({ toString: () => "12.34" })).toBe(1234);
  });

  it("centsToInputString gera o valor para edição em formulário", () => {
    expect(centsToInputString(125050)).toBe("1250,50");
  });
});

describe("formatBrl", () => {
  it("formata no padrão monetário brasileiro", () => {
    expect(formatBrl(123456)).toBe("R$ 1.234,56");
    expect(formatBrl(0)).toBe("R$ 0,00");
  });

  it("soma centavos exatamente (R$ 0,10 + R$ 0,20 = R$ 0,30)", () => {
    expect(formatBrl(10 + 20)).toBe("R$ 0,30");
  });
});
