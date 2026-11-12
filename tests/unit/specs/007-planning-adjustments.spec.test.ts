import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { expenseUpdateSchema } from "@/features/expenses/schemas";
import { contrastRatio } from "@/lib/contrast";
import { partEmptyMessage, partOptionLabel } from "@/lib/part-labels";
import { PRESENT_PARTS } from "@/lib/present-parts";

// Teste unitário rastreável à spec specs/007-planning-adjustments/spec.md (Princípio II).

const css = readFileSync(resolve(__dirname, "../../../src/app/globals.css"), "utf8");
const darkStart = css.indexOf("\n@media (prefers-color-scheme: dark) {");
const lightBlock = css.slice(css.indexOf("\n:root {"), darkStart);
const darkBlock = css.slice(darkStart);

function token(block: string, name: string): string {
  const match = new RegExp(`--${name}:\\s*(#[0-9a-f]{3,6})`, "i").exec(block);
  if (!match) throw new Error(`Token ${name} ausente`);
  return match[1];
}

describe("Spec 007 — US2: cores das partes", () => {
  it("FR-005: Gastos Essenciais laranja, Educação ciano e Livre roxo", () => {
    expect(token(lightBlock, "part-essentials")).toBe("#ea580c");
    expect(token(lightBlock, "part-education")).toBe("#0891b2");
    expect(token(lightBlock, "part-free")).toBe("#9333ea");
    expect(token(darkBlock, "part-essentials")).toBe(token(darkBlock, "present"));
    expect(token(darkBlock, "part-education")).toBe("#22d3ee");
    expect(token(darkBlock, "part-free")).toBe("#c084fc");
  });

  it("FR-007, SC-002: contraste ≥ 3:1 contra o fundo e o card nos dois temas", () => {
    for (const block of [lightBlock, darkBlock]) {
      for (const part of PRESENT_PARTS) {
        for (const surface of ["background", "card"]) {
          expect(contrastRatio(token(block, `part-${part}`), token(block, surface))).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });
});

describe("Spec 007 — US3: uma parte por vez", () => {
  it("FR-013: o seletor indica em texto a parte excedida", () => {
    expect(partOptionLabel("free", true)).toBe("Livre — excedida");
    expect(partOptionLabel("free", false)).toBe("Livre");
  });

  it("FR-015: a lista vazia cita a parte", () => {
    expect(partEmptyMessage("education")).toBe("Nenhum gasto em Educação.");
  });

  it("FR-012: a edição descarta a parte", () => {
    const parsed = expenseUpdateSchema.parse({
      name: "Curso",
      amount: "10",
      categoryId: "0b6f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59",
      part: "free",
    });
    expect(parsed).not.toHaveProperty("part");
  });
});
