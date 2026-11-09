import { describe, expect, it } from "vitest";
import { allocationSchema } from "@/features/allocation/schemas";

describe("allocationSchema", () => {
  it.each([0, 50, 100])("aceita %i", (value) => {
    expect(allocationSchema.safeParse({ essentialPercentage: value }).success).toBe(true);
  });

  it.each([-1, 101, 50.5, Number.NaN])("rejeita %d (inteiro 0–100)", (value) => {
    expect(allocationSchema.safeParse({ essentialPercentage: value }).success).toBe(false);
  });
});
