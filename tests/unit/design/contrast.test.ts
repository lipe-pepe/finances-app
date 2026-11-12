import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";

// Verifica o contraste AA dos tokens do tema nos dois temas (Princípio VI, SC-001).
// Lê os valores direto de src/app/globals.css: o teste falha se um token mudar para um par
// que não passa.

const css = readFileSync(resolve(__dirname, "../../../src/app/globals.css"), "utf8");

/** Extrai as variáveis hex de um bloco CSS (`--nome: #hex;`). */
function readTokens(block: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  for (const match of block.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{3,6})\s*;/gi)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}

/** Bloco de chaves que começa em `start` (conta chaves aninhadas). */
function blockAt(source: string, start: number): string {
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(open + 1, index);
    }
  }
  throw new Error("Bloco CSS sem fechamento");
}

const light = readTokens(blockAt(css, css.indexOf("\n:root {")));
const dark = { ...light, ...readTokens(blockAt(css, css.indexOf("@media (prefers-color-scheme: dark)"))) };

// Pares de contracts/design-tokens.md
const TEXT_PAIRS: [string, string][] = [
  ["foreground", "background"],
  ["foreground", "card"],
  ["muted-foreground", "card"],
  ["muted-foreground", "background"],
  ["primary-foreground", "primary"],
  ["income-foreground", "income"],
  ["present-foreground", "present"],
  ["future-foreground", "future"],
  ["income-ink", "card"],
  ["present-ink", "card"],
  ["future-ink", "card"],
  ["brand-ink", "card"],
  ["destructive", "card"],
  ["destructive", "danger-soft"],
];

const CATEGORY_KEYS = [
  "food",
  "housing",
  "transport",
  "health",
  "leisure",
  "emergency",
  "travel",
  "education",
  "bills",
  "investments",
  "other",
  "neutral",
  "none",
];

const GRAPHIC_PAIRS: [string, string][] = [
  ["primary", "background"],
  ["income", "card"],
  ["present", "card"],
  ["future", "card"],
  ["chart-limit", "card"],
  ["avatar-ring", "background"],
  ["avatar-ring", "card"],
  ["part-essentials", "background"],
  ["part-essentials", "card"],
  ["part-education", "background"],
  ["part-education", "card"],
  ["part-free", "background"],
  ["part-free", "card"],
  ["destructive", "background"],
  ...CATEGORY_KEYS.map((key): [string, string] => [`category-${key}`, `category-${key}-soft`]),
];

describe.each([
  ["claro", light],
  ["escuro", dark],
])("contraste dos tokens no tema %s", (theme, tokens) => {
  function ratio(a: string, b: string): number {
    if (!tokens[a] || !tokens[b]) {
      throw new Error(`Token ausente no tema ${theme}: ${tokens[a] ? b : a}`);
    }
    return contrastRatio(tokens[a], tokens[b]);
  }

  it.each(TEXT_PAIRS)("texto %s sobre %s tem pelo menos 4,5:1", (a, b) => {
    const value = ratio(a, b);
    expect(value, `${theme}: ${a}/${b} = ${value.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
  });

  it.each(GRAPHIC_PAIRS)("elemento %s sobre %s tem pelo menos 3:1", (a, b) => {
    const value = ratio(a, b);
    expect(value, `${theme}: ${a}/${b} = ${value.toFixed(2)}`).toBeGreaterThanOrEqual(3);
  });
});
