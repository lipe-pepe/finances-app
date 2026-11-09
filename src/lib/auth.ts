import "server-only";
import { redirect } from "next/navigation";
import { LOGIN_PATH } from "@/lib/auth-redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Retorna o id do usuário autenticado ou null. Usa `getUser()`, que valida o token no servidor
 * do Supabase Auth (nunca confiar apenas em `getSession()`).
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return data.user.id;
}

/** Igual a getCurrentUserId, mas redireciona para o login quando não há usuário. */
export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect(LOGIN_PATH);
  }
  return userId;
}
