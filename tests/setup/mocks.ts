import { vi } from "vitest";

// ---------------------------------------------------------------------------------------------
// Autenticação: usado nos testes das Server Actions de dados com
//   vi.mock("@/lib/auth", async () => (await import("../setup/mocks")).authModuleMock)
// ---------------------------------------------------------------------------------------------

const authState: { userId: string | null } = { userId: null };

/** Define o usuário "logado" nos testes (null = sem sessão). */
export function mockAuthenticatedUser(userId: string | null): void {
  authState.userId = userId;
}

export class RedirectError extends Error {
  constructor(public readonly destination: string) {
    super(`REDIRECT:${destination}`);
  }
}

export const authModuleMock = {
  getCurrentUserId: async () => authState.userId,
  requireUserId: async () => {
    if (!authState.userId) {
      throw new RedirectError("/login");
    }
    return authState.userId;
  },
};

// ---------------------------------------------------------------------------------------------
// next/headers: cookie store em memória (usado por signIn/signOut via @supabase/ssr)
// ---------------------------------------------------------------------------------------------

type StoredCookie = { name: string; value: string };
const cookieJar = new Map<string, StoredCookie>();

export function resetCookies(): void {
  cookieJar.clear();
}

export function getStoredCookies(): StoredCookie[] {
  return [...cookieJar.values()];
}

const cookieStore = {
  getAll: () => [...cookieJar.values()],
  get: (name: string) => cookieJar.get(name),
  has: (name: string) => cookieJar.has(name),
  set: (nameOrCookie: string | StoredCookie, value?: string) => {
    const cookie =
      typeof nameOrCookie === "string" ? { name: nameOrCookie, value: value ?? "" } : nameOrCookie;
    // Cookie vazio equivale a remoção (é assim que o Supabase limpa a sessão)
    if (cookie.value === "") {
      cookieJar.delete(cookie.name);
    } else {
      cookieJar.set(cookie.name, { name: cookie.name, value: cookie.value });
    }
  },
  delete: (name: string) => {
    cookieJar.delete(name);
  },
};

export const nextHeadersMock = {
  cookies: async () => cookieStore,
  headers: async () => new Headers(),
};

// ---------------------------------------------------------------------------------------------
// next/navigation: redirect lança RedirectError com o destino
// ---------------------------------------------------------------------------------------------

export const nextNavigationMock = {
  redirect: vi.fn((destination: string) => {
    throw new RedirectError(destination);
  }),
};
