import { describe, expect, it } from "vitest";
import { contrastRatio, parseHex } from "@/lib/contrast";

describe("contrast", () => {
  it("calcula os extremos do contraste WCAG", () => {
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 5);
  });

  it("é simétrico", () => {
    expect(contrastRatio("#DB2777", "#FFFFFF")).toBe(contrastRatio("#FFFFFF", "#DB2777"));
  });

  it("calcula o contraste da marca sobre o branco", () => {
    expect(Number(contrastRatio("#DB2777", "#FFFFFF").toFixed(2))).toBe(4.6);
  });

  it("aceita hex curto", () => {
    expect(contrastRatio("#fff", "#000")).toBeCloseTo(21, 5);
  });

  it("recusa valores que não são hex", () => {
    expect(() => parseHex("red")).toThrow();
    expect(() => parseHex("#12345")).toThrow();
  });
});
