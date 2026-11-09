import { describe, expect, it } from "vitest";
import { signInSchema } from "@/features/auth/schemas";

describe("signInSchema", () => {
  it("aceita email e senha válidos", () => {
    expect(signInSchema.safeParse({ email: "ana@exemplo.com", password: "123" }).success).toBe(true);
  });

  it("exige email válido", () => {
    const result = signInSchema.safeParse({ email: "ana", password: "123" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Informe um email válido.");
  });

  it("exige senha não vazia", () => {
    const result = signInSchema.safeParse({ email: "ana@exemplo.com", password: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Informe a senha.");
  });
});
