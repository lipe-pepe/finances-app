import { describe, expect, it } from "vitest";
import {
  DEFAULT_PLANNING_TAB,
  PLANNING_TABS,
  buildPlanningTabUrl,
  parsePlanningTab,
} from "@/lib/planning-tab";

describe("parsePlanningTab", () => {
  it("usa a aba Receita quando não há aba no endereço", () => {
    expect(parsePlanningTab(undefined)).toBe("income");
    expect(parsePlanningTab("")).toBe("income");
    expect(DEFAULT_PLANNING_TAB).toBe("income");
  });

  it.each(["income", "present", "future"] as const)("aceita %s", (tab) => {
    expect(parsePlanningTab(tab)).toBe(tab);
  });

  it.each([["xyz"], ["Present"], [["present", "future"]]])("trata %j como inválido", (value) => {
    expect(parsePlanningTab(value)).toBe("income");
  });
});

describe("buildPlanningTabUrl", () => {
  it("remove o parâmetro para a aba Receita", () => {
    expect(buildPlanningTabUrl("income")).toBe("/");
  });

  it("inclui o parâmetro tab para as demais abas", () => {
    expect(buildPlanningTabUrl("present")).toBe("/?tab=present");
    expect(buildPlanningTabUrl("future")).toBe("/?tab=future");
  });
});

describe("PLANNING_TABS", () => {
  it("segue a ordem Receita, Momento Presente, Momento Futuro", () => {
    expect(PLANNING_TABS).toEqual(["income", "present", "future"]);
  });
});
