import { createClient } from "@supabase/supabase-js";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { TEST_PASSWORD, TEST_USERS, createTestUsers, type TestUsers } from "../setup/db";
import { RedirectError, getStoredCookies, resetCookies } from "../setup/mocks";
import { signIn, signOut } from "@/features/auth/actions";
import { getCurrentUserId } from "@/lib/auth";

// Este arquivo NÃO mocka @/lib/auth: usa o Supabase Auth local de verdade, com os cookies em
// memória do mock de next/headers.

const GENERIC_ERROR = { ok: false, error: { code: "INVALID_CREDENTIALS" } };

describe("signIn / signOut", () => {
  let users: TestUsers;

  beforeAll(async () => {
    users = await createTestUsers();
  });

  beforeEach(() => {
    resetCookies();
  });

  it("entra com credenciais corretas, grava a sessão e redireciona para /", async () => {
    await expect(signIn({ email: TEST_USERS.a, password: TEST_PASSWORD })).rejects.toEqual(
      new RedirectError("/"),
    );
    expect(getStoredCookies().length).toBeGreaterThan(0);
    await expect(getCurrentUserId()).resolves.toBe(users.userA);
  });

  it("retorna a mesma mensagem genérica para senha errada e email inexistente", async () => {
    await expect(signIn({ email: TEST_USERS.a, password: "senha-errada" })).resolves.toEqual(
      GENERIC_ERROR,
    );
    await expect(
      signIn({ email: "nao.existe@teste.local", password: TEST_PASSWORD }),
    ).resolves.toEqual(GENERIC_ERROR);
    expect(getStoredCookies()).toEqual([]);
  });

  it("retorna VALIDATION para entrada inválida", async () => {
    const result = await signIn({ email: "invalido", password: "" });
    expect(result).toMatchObject({ ok: false, error: { code: "VALIDATION" } });
  });

  it("sai, limpa a sessão e redireciona para /login (idempotente)", async () => {
    await signIn({ email: TEST_USERS.a, password: TEST_PASSWORD }).catch(() => undefined);
    await expect(signOut()).rejects.toEqual(new RedirectError("/login"));
    await expect(getCurrentUserId()).resolves.toBeNull();
    await expect(signOut()).rejects.toEqual(new RedirectError("/login"));
  });

  it("não permite cadastro público pela API (FR-007)", async () => {
    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false } },
    );
    const { data, error } = await anon.auth.signUp({
      email: `novo.${Date.now()}@teste.local`,
      password: TEST_PASSWORD,
    });
    expect(error).not.toBeNull();
    expect(data.user).toBeNull();
  });
});
