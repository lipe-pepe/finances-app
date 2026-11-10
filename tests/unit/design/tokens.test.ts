import { describe, expect, it } from "vitest";
import { findHardcodedStyles, violatedRules } from "./scan-hardcoded";

describe("tokens do tema (Princípio VI)", () => {
  it.each([
    ['className="bg-pink-600"'],
    ['style={{ color: "#DB2777" }}'],
    ['className="text-[13px]"'],
    ['className="bg-[#fff]"'],
    ['fill="rgb(0,0,0)"'],
  ])("detecta valor escrito à mão em %s", (line) => {
    expect(violatedRules(line).length).toBeGreaterThan(0);
  });

  it.each([['className="bg-primary text-muted-foreground"'], ['href="#conteudo"'], ['className="bg-category-food-soft"']])(
    "aceita token %s",
    (line) => {
      expect(violatedRules(line)).toEqual([]);
    },
  );

  it("nenhum componente tem cor ou tamanho escrito à mão", () => {
    const findings = findHardcodedStyles().map(
      (finding) => `${finding.file}:${finding.line} (${finding.rule}) ${finding.text}`,
    );
    expect(findings).toEqual([]);
  });
});
