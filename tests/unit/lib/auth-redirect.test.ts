import { describe, expect, it } from "vitest";
import { resolveAuthRedirect } from "@/lib/auth-redirect";

describe("resolveAuthRedirect", () => {
  it("leva usuário deslogado da tela de planejamento para o login", () => {
    expect(resolveAuthRedirect("/", false)).toBe("/login");
  });

  it("leva usuário logado do login para a tela de planejamento", () => {
    expect(resolveAuthRedirect("/login", true)).toBe("/");
  });

  it("não redireciona usuário logado na tela de planejamento", () => {
    expect(resolveAuthRedirect("/", true)).toBeNull();
  });

  it("não redireciona usuário deslogado na tela de login", () => {
    expect(resolveAuthRedirect("/login", false)).toBeNull();
  });

  it("protege qualquer outra rota da área logada", () => {
    expect(resolveAuthRedirect("/qualquer-rota", false)).toBe("/login");
  });
});
