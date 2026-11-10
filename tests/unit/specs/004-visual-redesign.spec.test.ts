import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getCategoryStyle } from "@/lib/category-style";
import { contrastRatio } from "@/lib/contrast";
import { usedLabel } from "@/lib/control-labels";
import { incomeCountLabel, momentSummary } from "@/lib/planning-labels";
import { getUsageBarPercentage, getUsedPercentage } from "@/lib/spending";
import { findHardcodedStyles } from "../design/scan-hardcoded";

// Teste unitário rastreável à spec specs/004-visual-redesign/spec.md (Princípio II).

const css = readFileSync(resolve(__dirname, "../../../src/app/globals.css"), "utf8");
const darkBlock = css.slice(css.indexOf("@media (prefers-color-scheme: dark)"));

function token(block: string, name: string): string {
  const match = new RegExp(`--${name}:\\s*(#[0-9a-f]{3,6})`, "i").exec(block);
  if (!match) throw new Error(`Token ${name} ausente`);
  return match[1];
}

describe("Spec 004 — US1: identidade, temas e contraste", () => {
  it("FR-002: há tema escuro pela preferência do dispositivo", () => {
    expect(css).toContain("@custom-variant dark (@media (prefers-color-scheme: dark))");
  });

  it("FR-003: texto principal e texto sobre a marca passam no AA nos dois temas", () => {
    for (const block of [css, darkBlock]) {
      expect(contrastRatio(token(block, "foreground"), token(block, "background"))).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(token(block, "primary-foreground"), token(block, "primary"))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("FR-004: as cores com significado existem nos dois temas", () => {
    for (const name of ["primary", "income", "present", "future", "destructive"]) {
      expect(token(css, name)).toMatch(/^#/);
      expect(token(darkBlock, name)).toMatch(/^#/);
    }
  });

  it("SC-007: nenhum componente tem cor ou tamanho escrito à mão", () => {
    expect(findHardcodedStyles()).toEqual([]);
  });
});

describe("Spec 004 — US2: Controle", () => {
  it("cenário 1 / FR-008: R$ 750,00 de R$ 1.500,00 = Usado 50%", () => {
    expect(usedLabel(getUsedPercentage(75000, 150000))).toBe("50%");
  });

  it("cenário 2 / FR-008: acima do limite o percentual passa de 100% e a barra para em 100%", () => {
    const used = getUsedPercentage(160500, 150000);
    expect(usedLabel(used)).toBe("107%");
    expect(getUsageBarPercentage(used)).toBe(100);
  });

  it("edge case: planejado zero com gasto mostra uso indefinido e barra cheia", () => {
    const used = getUsedPercentage(100, 0);
    expect(usedLabel(used)).toBe("—");
    expect(getUsageBarPercentage(used)).toBe(100);
  });

  it("FR-011: cada categoria do seed tem um ícone próprio e as demais usam o neutro", () => {
    const names = [
      "Alimentação",
      "Moradia",
      "Transporte",
      "Saúde",
      "Lazer",
      "Reserva de Emergência",
      "Viagem",
      "Educação",
      "Contas e Serviços",
      "Investimentos",
      "Outros",
    ];
    const keys = names.map((name) => getCategoryStyle(name).key);
    expect(new Set(keys).size).toBe(names.length);
    expect(getCategoryStyle("Categoria nova").key).toBe("neutral");
    expect(getCategoryStyle(null).key).toBe("none");
  });
});

describe("Spec 004 — US3: Planejamento", () => {
  it("cenário 2 / FR-017: o card Receita conta os ganhos", () => {
    expect(incomeCountLabel(2)).toBe("2 ganhos cadastrados");
    expect(incomeCountLabel(1)).toBe("1 ganho cadastrado");
    expect(incomeCountLabel(0)).toBe("Nenhum ganho cadastrado");
  });

  it("cenário 3 / FR-017: o card do Momento Presente resume receita, gastos e uso", () => {
    const used = getUsedPercentage(275000, 312525);
    expect(momentSummary("expenses", 50, 275000, used)).toBe(
      "50% da receita · gastos R$ 2.750,00 (88%)",
    );
  });
});
