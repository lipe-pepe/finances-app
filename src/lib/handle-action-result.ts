import type { ActionResult } from "@/lib/action-result";
import { LOGIN_PATH } from "@/lib/auth-redirect";

// Tratamento padronizado do retorno das Server Actions no cliente (formulários e slider)

export const CONNECTION_ERROR_MESSAGE =
  "Não foi possível salvar. Verifique sua conexão e tente novamente.";
export const GENERIC_ERROR_MESSAGE = "Não foi possível concluir a operação. Tente novamente.";
export const INVALID_CREDENTIALS_MESSAGE = "Email ou senha inválidos.";

type RouterLike = { push(href: string): void };

export type RunActionOptions<T> = {
  router: RouterLike;
  onSuccess?: (data: T) => void;
  onValidationError?: (fieldErrors: Record<string, string[]>) => void;
};

/** Resultado para a UI: `message` é o texto a exibir, ou null quando não há o que exibir. */
export type RunActionOutcome = { ok: boolean; message: string | null };

/**
 * Executa uma Server Action e traduz o resultado:
 * - exceção (ex.: falha de rede) → aviso de conexão
 * - UNAUTHENTICATED (sessão expirada) → redireciona para /login
 * - VALIDATION → repassa os erros por campo
 * - NOT_FOUND / UNKNOWN → mensagem genérica
 */
export async function runAction<T>(
  action: () => Promise<ActionResult<T>>,
  options: RunActionOptions<T>,
): Promise<RunActionOutcome> {
  let result: ActionResult<T> | undefined;
  try {
    result = await action();
  } catch {
    return { ok: false, message: CONNECTION_ERROR_MESSAGE };
  }

  // Uma action que chamou redirect() não devolve valor: a navegação já está em andamento
  if (!result) {
    return { ok: true, message: null };
  }

  if (result.ok) {
    options.onSuccess?.(result.data);
    return { ok: true, message: null };
  }

  switch (result.error.code) {
    case "UNAUTHENTICATED":
      options.router.push(LOGIN_PATH);
      return { ok: false, message: null };
    case "VALIDATION":
      options.onValidationError?.(result.error.fieldErrors);
      return { ok: false, message: null };
    case "INVALID_CREDENTIALS":
      return { ok: false, message: INVALID_CREDENTIALS_MESSAGE };
    default:
      return { ok: false, message: GENERIC_ERROR_MESSAGE };
  }
}

/** Aplica erros de validação do servidor nos campos do React Hook Form. */
export function applyFieldErrors<TField extends string>(
  fieldErrors: Record<string, string[]>,
  setError: (field: TField, error: { type: string; message: string }) => void,
): void {
  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages[0]) {
      setError(field as TField, { type: "server", message: messages[0] });
    }
  }
}
