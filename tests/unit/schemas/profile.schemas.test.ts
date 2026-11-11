import { describe, expect, it } from "vitest";
import { profileSchema } from "@/features/profile/schemas";

function errorsOf(input: unknown) {
  const result = profileSchema.safeParse(input);
  return result.success ? null : result.error.issues.map((issue) => issue.message);
}

describe("profileSchema", () => {
  it("remove espaços e transforma sobrenome vazio em null", () => {
    expect(profileSchema.parse({ firstName: " Ana ", lastName: "" })).toEqual({
      firstName: "Ana",
      lastName: null,
    });
  });

  it("aceita hífens, apóstrofos e acentos", () => {
    expect(profileSchema.parse({ firstName: "Ana-Clara", lastName: "D'Ávila" })).toEqual({
      firstName: "Ana-Clara",
      lastName: "D'Ávila",
    });
  });

  it("exige o nome", () => {
    expect(errorsOf({ firstName: "", lastName: "" })).toEqual(["Informe o nome."]);
    expect(errorsOf({ firstName: "   ", lastName: "" })).toEqual(["Informe o nome."]);
  });

  it("limita nome e sobrenome a 50 caracteres", () => {
    expect(errorsOf({ firstName: "a".repeat(51), lastName: "" })).toEqual([
      "Use no máximo 50 caracteres.",
    ]);
    expect(errorsOf({ firstName: "a".repeat(50), lastName: "" })).toBeNull();
    expect(errorsOf({ firstName: "Ana", lastName: "b".repeat(51) })).toEqual([
      "Use no máximo 50 caracteres.",
    ]);
  });

  it("descarta o email (FR-017)", () => {
    const data = profileSchema.parse({ firstName: "Ana", lastName: "", email: "outro@x.com" });
    expect(data).not.toHaveProperty("email");
  });
});
