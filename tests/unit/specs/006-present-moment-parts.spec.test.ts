import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";
import { calculatePlannedCents } from "@/lib/planning";
import {
  PRESENT_PARTS,
  getPartBarWidths,
  getPartCents,
  rescaleParts,
  splitFromThumbs,
  toPartPercentages,
} from "@/lib/present-parts";
import { filterActualExpenses } from "@/lib/spending";
import { presentPartSchema } from "@/lib/validation";

// Teste unitário rastreável à spec specs/006-present-moment-parts/spec.md (Princípio II).

const css = readFileSync(resolve(__dirname, "../../../src/app/globals.css"), "utf8");
const lightBlock = css.slice(css.indexOf("\n:root {"));
const darkBlock = css.slice(css.indexOf("@media (prefers-color-scheme: dark)"));

function token(block: string, name: string): string {
  const match = new RegExp(`--${name}:\\s*(#[0-9a-f]{3,6})`, "i").exec(block);
  if (!match) throw new Error(`Token ${name} ausente`);
  return match[1];
}

describe("Spec 006 — US1: dividir o Momento Presente", () => {
  it("FR-003, SC-001: as partes sempre somam o Momento Presente", () => {
    for (const thumbs of [[0, 0], [60, 65], [70, 70], [10, 40]]) {
      const parts = splitFromThumbs(thumbs, 70);
      expect(parts.essentials + parts.education + parts.free).toBe(70);
    }
  });

  it("US1-2 / FR-004: 60/5/5 com Receita de R$ 10.000,00 vale R$ 6.000,00 / R$ 500,00 / R$ 500,00", () => {
    expect(getPartCents(1_000_000, { essentials: 60, education: 5, free: 5 })).toEqual({
      essentials: 600000,
      education: 50000,
      free: 50000,
    });
  });

  it("FR-007: sem divisão, todo o Momento Presente fica em Gastos Essenciais", () => {
    expect(toPartPercentages(70, 0, 0)).toEqual({ essentials: 70, education: 0, free: 0 });
  });

  it("FR-008: mudar o Momento Presente de 70% para 35% reajusta 60/5/5 para 30/3/2", () => {
    expect(rescaleParts({ essentials: 60, education: 5, free: 5 }, 35)).toEqual({
      essentials: 30,
      education: 3,
      free: 2,
    });
  });

  it("Edge Cases: o resto de centavos fica em Livre e a soma fecha com o Momento Presente", () => {
    const cents = getPartCents(33_333, { essentials: 33, education: 33, free: 34 });
    expect(cents.essentials + cents.education + cents.free).toBe(calculatePlannedCents(33_333, 100));
  });
});

describe("Spec 006 — US2/US3: parte dos gastos", () => {
  it("FR-011, FR-015, FR-022: só as três partes são aceitas", () => {
    expect(PRESENT_PARTS).toEqual(["essentials", "education", "free"]);
    expect(presentPartSchema.safeParse("education").success).toBe(true);
    expect(presentPartSchema.safeParse("outra").success).toBe(false);
  });
});

describe("Spec 006 — US4/US5: Controle por parte", () => {
  it("FR-024: a barra fica 100% preenchida acima do limite, mantendo a proporção", () => {
    const widths = getPartBarWidths({ essentials: 800000, education: 100000, free: 100000 }, 700000);
    expect(widths.essentials + widths.education + widths.free).toBeCloseTo(100, 5);
    expect(widths.essentials).toBeCloseTo(80, 5);
  });

  it("FR-028: a parte ativa e a categoria filtram juntas", () => {
    const items = [
      { amountCents: 1, categoryId: "a", spentOn: "2026-11-01", part: "education" as const },
      { amountCents: 1, categoryId: "b", spentOn: "2026-11-01", part: "education" as const },
      { amountCents: 1, categoryId: "a", spentOn: "2026-11-01", part: "free" as const },
    ];
    expect(filterActualExpenses(items, { category: "a", part: "education" })).toHaveLength(1);
    expect(filterActualExpenses(items, { category: "all", part: null })).toHaveLength(3);
  });

  it("FR-019: as cores das partes têm contraste ≥ 3:1 nos dois temas", () => {
    for (const block of [lightBlock, darkBlock]) {
      for (const part of PRESENT_PARTS) {
        for (const surface of ["background", "card"]) {
          expect(contrastRatio(token(block, `part-${part}`), token(block, surface))).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });
});
