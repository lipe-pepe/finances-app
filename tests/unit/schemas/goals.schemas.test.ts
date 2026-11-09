import { describe, expect, it } from "vitest";
import { NO_CATEGORY, goalSchema } from "@/features/goals/schemas";

const CATEGORY_ID = "0b6f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59";

describe("goalSchema", () => {
  it("aceita meta sem categoria (ausente, null, vazia ou 'sem categoria')", () => {
    for (const categoryId of [undefined, null, "", NO_CATEGORY]) {
      expect(goalSchema.parse({ name: "Viagem", amount: "500", categoryId })).toEqual({
        name: "Viagem",
        amount: 50000,
        categoryId: null,
      });
    }
  });

  it("aceita meta com categoria (uuid opcional)", () => {
    expect(
      goalSchema.parse({ name: "Curso", amount: "300", categoryId: CATEGORY_ID }).categoryId,
    ).toBe(CATEGORY_ID);
  });

  it("rejeita categoria malformada", () => {
    expect(goalSchema.safeParse({ name: "Curso", amount: "300", categoryId: "x" }).success).toBe(
      false,
    );
  });

  it("exige nome e valor", () => {
    expect(goalSchema.safeParse({ name: "", amount: "" }).success).toBe(false);
  });
});
