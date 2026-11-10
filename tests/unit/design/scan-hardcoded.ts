import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

// Varredura de valores visuais escritos à mão nos componentes (Princípio VI, SC-007).
// src/components/ui fica de fora: é código do shadcn/ui, que já usa os tokens do tema.

const ROOT = resolve(__dirname, "../../..");
const SCANNED_DIRS = ["src/app", "src/features", "src/components"];
const IGNORED_DIRS = [join("src", "components", "ui")];

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";

const RULES: { name: string; pattern: RegExp }[] = [
  { name: "cor hex", pattern: /(["'`\s(])#[0-9a-fA-F]{3,8}\b/ },
  { name: "função de cor", pattern: /\b(?:rgba?|hsla?|oklch)\(/ },
  { name: "cor arbitrária", pattern: /-\[#/ },
  { name: "tamanho de texto arbitrário", pattern: /\btext-\[\d+(?:\.\d+)?px\]/ },
  {
    name: "cor da paleta bruta",
    pattern: new RegExp(`\\b(?:bg|text|border|fill|stroke|ring|from|to|outline)-(?:${PALETTE})-\\d{2,3}\\b`),
  },
];

/** Regras que uma linha de código viola (usado também para testar a própria varredura). */
export function violatedRules(text: string): string[] {
  return RULES.filter((rule) => rule.pattern.test(text)).map((rule) => rule.name);
}

export type Finding = { file: string; line: number; rule: string; text: string };

function listFiles(dir: string): string[] {
  const absolute = join(ROOT, dir);
  return readdirSync(absolute).flatMap((entry) => {
    const path = join(dir, entry);
    if (IGNORED_DIRS.includes(path)) return [];
    if (statSync(join(ROOT, path)).isDirectory()) return listFiles(path);
    return /\.(tsx?|css)$/.test(entry) && !entry.endsWith(".css") ? [path] : [];
  });
}

/** Lista as ocorrências de valores visuais escritos à mão. */
export function findHardcodedStyles(): Finding[] {
  return SCANNED_DIRS.flatMap(listFiles).flatMap((file) =>
    readFileSync(join(ROOT, file), "utf8")
      .split("\n")
      .flatMap((text, index) =>
        RULES.filter((rule) => rule.pattern.test(text)).map((rule) => ({
          file: relative(ROOT, join(ROOT, file)),
          line: index + 1,
          rule: rule.name,
          text: text.trim(),
        })),
      ),
  );
}
