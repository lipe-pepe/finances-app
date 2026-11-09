"use server";

import { redirect } from "next/navigation";
import { fail, validationError, type ActionResult } from "@/lib/action-result";
import { HOME_PATH, LOGIN_PATH } from "@/lib/auth-redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signInSchema, type SignInInput } from "@/features/auth/schemas";

/** Login com email e senha. Em sucesso, grava a sessão nos cookies e redireciona para "/". */
export async function signIn(input: SignInInput): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Mensagem genérica: não revela se o email existe (FR-002)
    return fail({ code: "INVALID_CREDENTIALS" });
  }

  redirect(HOME_PATH);
}

/** Encerra a sessão e volta para o login. Idempotente. */
export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(LOGIN_PATH);
}
