import { CONTROL_PATH } from "@/lib/app-routes";

// Regra de redirecionamento por autenticação (função pura, usada pelo proxy)

export const LOGIN_PATH = "/login";
/** Destino do usuário logado ao abrir a plataforma ou após o login: a página Controle (FR-003). */
export const HOME_PATH = CONTROL_PATH;

const PUBLIC_PATHS = new Set([LOGIN_PATH]);

/**
 * Retorna o caminho para onde o usuário deve ser redirecionado, ou null se puder seguir.
 * - Sem usuário em rota protegida → /login (FR-005)
 * - Com usuário na página inicial ou no login → /control (FR-003)
 */
export function resolveAuthRedirect(pathname: string, hasUser: boolean): string | null {
  const isPublic = PUBLIC_PATHS.has(pathname);
  if (!hasUser && !isPublic) {
    return LOGIN_PATH;
  }
  if (hasUser && (pathname === LOGIN_PATH || pathname === "/")) {
    return HOME_PATH;
  }
  return null;
}
