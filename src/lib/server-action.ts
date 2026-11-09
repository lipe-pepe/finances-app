import "server-only";
import { getCurrentUserId } from "@/lib/auth";
import { fail, type ActionResult } from "@/lib/action-result";
import { idSchema } from "@/lib/validation";

/**
 * Executa a lógica de uma Server Action protegida: sem usuário → UNAUTHENTICATED; erro
 * inesperado → UNKNOWN (registrado no log do servidor, sem detalhes para o cliente).
 */
export async function authenticatedAction<T>(
  handler: (userId: string) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return fail({ code: "UNAUTHENTICATED" });
  }
  try {
    return await handler(userId);
  } catch (error) {
    console.error("Erro inesperado em Server Action:", error);
    return fail({ code: "UNKNOWN" });
  }
}

/** Ids malformados são tratados como inexistentes (NOT_FOUND), sem revelar nada. */
export function isValidId(id: unknown): id is string {
  return idSchema.safeParse(id).success;
}
