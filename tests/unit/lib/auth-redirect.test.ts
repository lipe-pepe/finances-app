import { describe, expect, it } from "vitest";
import { HOME_PATH, resolveAuthRedirect } from "@/lib/auth-redirect";

describe("resolveAuthRedirect", () => {
  it("usa a página Controle como destino inicial", () => {
    expect(HOME_PATH).toBe("/control");
  });

  it("leva usuário logado da página inicial para o Controle", () => {
    expect(resolveAuthRedirect("/", true)).toBe("/control");
  });

  it("leva usuário logado do login para o Controle", () => {
    expect(resolveAuthRedirect("/login", true)).toBe("/control");
  });

  it("leva usuário deslogado das páginas da área logada para o login", () => {
    expect(resolveAuthRedirect("/", false)).toBe("/login");
    expect(resolveAuthRedirect("/planning", false)).toBe("/login");
    expect(resolveAuthRedirect("/control", false)).toBe("/login");
  });

  it("não redireciona usuário logado no Planejamento ou no Controle", () => {
    expect(resolveAuthRedirect("/planning", true)).toBeNull();
    expect(resolveAuthRedirect("/control", true)).toBeNull();
  });

  it("não redireciona usuário deslogado na tela de login", () => {
    expect(resolveAuthRedirect("/login", false)).toBeNull();
  });

  it("protege qualquer outra rota da área logada", () => {
    expect(resolveAuthRedirect("/qualquer-rota", false)).toBe("/login");
  });
});
