import { describe, expect, it, vi } from "vitest";
import {
  CONNECTION_ERROR_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  INVALID_CREDENTIALS_MESSAGE,
  runAction,
} from "@/lib/handle-action-result";

function createRouter() {
  return { push: vi.fn() };
}

describe("runAction", () => {
  it("chama onSuccess com os dados em caso de sucesso", async () => {
    const router = createRouter();
    const onSuccess = vi.fn();
    const result = await runAction(async () => ({ ok: true as const, data: { id: "1" } }), {
      router,
      onSuccess,
    });
    expect(result).toEqual({ ok: true, message: null });
    expect(onSuccess).toHaveBeenCalledWith({ id: "1" });
  });

  it("mostra aviso de conexão quando a action lança exceção", async () => {
    const result = await runAction(
      async () => {
        throw new TypeError("Failed to fetch");
      },
      { router: createRouter() },
    );
    expect(result).toEqual({ ok: false, message: CONNECTION_ERROR_MESSAGE });
  });

  it("redireciona para /login quando a sessão expirou", async () => {
    const router = createRouter();
    const result = await runAction(
      async () => ({ ok: false as const, error: { code: "UNAUTHENTICATED" as const } }),
      { router },
    );
    expect(router.push).toHaveBeenCalledWith("/login");
    expect(result).toEqual({ ok: false, message: null });
  });

  it("repassa os erros de validação por campo", async () => {
    const onValidationError = vi.fn();
    const fieldErrors = { name: ["Informe o nome."] };
    const result = await runAction(
      async () => ({ ok: false as const, error: { code: "VALIDATION" as const, fieldErrors } }),
      { router: createRouter(), onValidationError },
    );
    expect(onValidationError).toHaveBeenCalledWith(fieldErrors);
    expect(result).toEqual({ ok: false, message: null });
  });

  it("usa mensagem genérica para NOT_FOUND e UNKNOWN", async () => {
    for (const code of ["NOT_FOUND", "UNKNOWN"] as const) {
      const result = await runAction(async () => ({ ok: false as const, error: { code } }), {
        router: createRouter(),
      });
      expect(result).toEqual({ ok: false, message: GENERIC_ERROR_MESSAGE });
    }
  });

  it("usa a mensagem genérica de login para INVALID_CREDENTIALS", async () => {
    const result = await runAction(
      async () => ({ ok: false as const, error: { code: "INVALID_CREDENTIALS" as const } }),
      { router: createRouter() },
    );
    expect(result).toEqual({ ok: false, message: INVALID_CREDENTIALS_MESSAGE });
  });

  it("trata retorno vazio (action que redirecionou) como sucesso", async () => {
    const result = await runAction(async () => undefined as never, { router: createRouter() });
    expect(result).toEqual({ ok: true, message: null });
  });
});
