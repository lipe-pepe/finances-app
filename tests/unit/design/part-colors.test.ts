import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Cores das partes do Momento Presente (feature 007, FR-005): laranja, ciano e roxo.

const css = readFileSync(resolve(__dirname, "../../../src/app/globals.css"), "utf8");
const lightBlock = css.slice(css.indexOf("\n:root {"), css.indexOf("\n@media (prefers-color-scheme: dark) {"));
const darkBlock = css.slice(css.indexOf("\n@media (prefers-color-scheme: dark) {"));

function token(block: string, name: string): string | undefined {
  return new RegExp(`--${name}:\\s*(#[0-9a-f]{3,6})`, "i").exec(block)?.[1];
}

describe("cores das partes (feature 007)", () => {
  it("tema claro: laranja, ciano e roxo", () => {
    expect(token(lightBlock, "part-essentials")).toBe("#ea580c");
    expect(token(lightBlock, "part-education")).toBe("#0891b2");
    expect(token(lightBlock, "part-free")).toBe("#9333ea");
  });

  it("tema escuro: o laranja é o mesmo do Momento Presente, com ciano e roxo", () => {
    expect(token(darkBlock, "part-essentials")).toBe(token(darkBlock, "present"));
    expect(token(darkBlock, "part-education")).toBe("#22d3ee");
    expect(token(darkBlock, "part-free")).toBe("#c084fc");
  });
});
