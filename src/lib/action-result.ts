import { z } from "zod";

// Contrato de retorno das Server Actions (ver specs/001-financial-planning/contracts/server-actions.md)

export type ActionError =
  | { code: "UNAUTHENTICATED" }
  | { code: "VALIDATION"; fieldErrors: Record<string, string[]> }
  | { code: "NOT_FOUND" }
  | { code: "INVALID_CREDENTIALS" }
  | { code: "UNKNOWN" };

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: ActionError };

export function ok<T>(data: T): ActionResult<T>;
export function ok(): ActionResult<void>;
export function ok<T>(data?: T): ActionResult<T | undefined> {
  return { ok: true, data };
}

export function fail(error: ActionError): { ok: false; error: ActionError } {
  return { ok: false, error };
}

/** Converte um erro do Zod em erro de validação com mensagens por campo. */
export function validationError(error: z.ZodError): { ok: false; error: ActionError } {
  const { fieldErrors } = z.flattenError(error);
  const normalized: Record<string, string[]> = {};
  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (Array.isArray(messages) && messages.length > 0) {
      normalized[field] = messages as string[];
    }
  }
  return fail({ code: "VALIDATION", fieldErrors: normalized });
}

/** Erro de validação para um único campo (ex.: categoria inexistente). */
export function fieldError(field: string, message: string): { ok: false; error: ActionError } {
  return fail({ code: "VALIDATION", fieldErrors: { [field]: [message] } });
}
