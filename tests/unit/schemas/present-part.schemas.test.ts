import { describe, expect, it } from "vitest";
import { presentPartSchema } from "@/lib/validation";

describe("presentPartSchema", () => {
  it("aceita as três partes", () => {
    for (const part of ["essentials", "education", "free"]) {
      expect(presentPartSchema.parse(part)).toBe(part);
    }
  });

  it("recusa valores fora da lista (FR-022)", () => {
    for (const value of ["", "livre", undefined]) {
      const result = presentPartSchema.safeParse(value);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe("Selecione a parte.");
    }
  });
});
