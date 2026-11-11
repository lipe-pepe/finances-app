import { describe, expect, it } from "vitest";
import { getDisplayName, getInitials } from "@/lib/initials";

const email = "x@y.com";

describe("getInitials", () => {
  it("usa a primeira letra do nome e do sobrenome", () => {
    expect(getInitials({ firstName: "Felipe", lastName: "Pêpe", email })).toBe("FP");
  });

  it("usa só o nome quando não há sobrenome, em maiúscula", () => {
    expect(getInitials({ firstName: "ana", lastName: null, email })).toBe("A");
  });

  it("preserva acentos", () => {
    expect(getInitials({ firstName: "élio", lastName: "ávila", email })).toBe("ÉÁ");
  });

  it("usa a inicial do email quando não há nome", () => {
    expect(getInitials({ firstName: null, lastName: null, email: "maria@teste.local" })).toBe("M");
    expect(getInitials({ firstName: "  ", lastName: null, email: "z@t.com" })).toBe("Z");
  });

  it("nunca devolve mais de 2 caracteres", () => {
    expect(getInitials({ firstName: "Ana Maria", lastName: "Souza Lima", email }).length).toBe(2);
  });
});

describe("getDisplayName", () => {
  it("junta nome e sobrenome", () => {
    expect(getDisplayName({ firstName: "Ana-Clara", lastName: "D'Ávila", email })).toBe(
      "Ana-Clara D'Ávila",
    );
  });

  it("usa só o nome quando não há sobrenome", () => {
    expect(getDisplayName({ firstName: "Ana", lastName: null, email })).toBe("Ana");
  });

  it("usa o email quando não há nome", () => {
    expect(getDisplayName({ firstName: null, lastName: null, email: "a@b.com" })).toBe("a@b.com");
  });
});
