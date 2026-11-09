import { beforeEach, describe, expect, it, vi } from "vitest";

// Cliente Supabase e redirect mockados: o teste cobre só a regra de autenticação
const getUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({ auth: { getUser } }),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

import { getCurrentUserId, requireUserId } from "@/lib/auth";

describe("auth", () => {
  beforeEach(() => {
    getUser.mockReset();
  });

  it("getCurrentUserId retorna o id quando há usuário", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-a" } }, error: null });
    await expect(getCurrentUserId()).resolves.toBe("user-a");
  });

  it("getCurrentUserId retorna null sem usuário", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(getCurrentUserId()).resolves.toBeNull();
  });

  it("getCurrentUserId retorna null quando o Supabase retorna erro", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: new Error("JWT expired") });
    await expect(getCurrentUserId()).resolves.toBeNull();
  });

  it("requireUserId redireciona para /login sem usuário", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(requireUserId()).rejects.toThrow("REDIRECT:/login");
  });

  it("requireUserId retorna o id com usuário", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "user-a" } }, error: null });
    await expect(requireUserId()).resolves.toBe("user-a");
  });
});
