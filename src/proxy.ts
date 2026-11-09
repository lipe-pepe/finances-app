import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { resolveAuthRedirect } from "@/lib/auth-redirect";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Proxy (antigo middleware): renova a sessão do Supabase em toda requisição, gravando os cookies
 * atualizados na resposta, e aplica os redirecionamentos de autenticação.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseEnv();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // getUser() valida o token e dispara a renovação da sessão quando necessário
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const target = resolveAuthRedirect(request.nextUrl.pathname, Boolean(user));
  if (!target) {
    return response;
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = target;
  redirectUrl.search = "";
  const redirectResponse = NextResponse.redirect(redirectUrl);
  // Preserva os cookies de sessão renovados no redirecionamento
  response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
  return redirectResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
