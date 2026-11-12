import { describe, expect, it } from "vitest";
import { allocationSchema, presentSplitSchema } from "@/features/allocation/schemas";

describe("allocationSchema", () => {
  it.each([0, 50, 100])("aceita %i", (value) => {
    expect(allocationSchema.safeParse({ essentialPercentage: value }).success).toBe(true);
  });

  it.each([-1, 101, 50.5, Number.NaN])("rejeita %d (inteiro 0–100)", (value) => {
    expect(allocationSchema.safeParse({ essentialPercentage: value }).success).toBe(false);
  });
});

describe("presentSplitSchema", () => {
  it("aceita porcentagens inteiras não negativas", () => {
    expect(presentSplitSchema.safeParse({ educationPercentage: 5, freePercentage: 5 }).success).toBe(true);
  });

  it.each([
    { educationPercentage: -1, freePercentage: 0 },
    { educationPercentage: 2.5, freePercentage: 0 },
    { educationPercentage: "5", freePercentage: 0 },
  ])("recusa %o com 'Porcentagem inválida.'", (input) => {
    const result = presentSplitSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Porcentagem inválida.");
  });
});
