import "server-only";
import { extensionFor, type AvatarType } from "@/lib/avatar-file";
import type { createSupabaseServerClient } from "@/lib/supabase/server";

// Acesso ao bucket privado das fotos de perfil (specs/005-user-profile/research.md R2/R3).
// Sempre com o cliente da sessão do usuário: as políticas do Storage restringem cada usuário à
// própria pasta, e nenhuma chave privilegiada é usada pela aplicação.

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export const AVATAR_BUCKET = "avatars";
export const SIGNED_URL_TTL_SECONDS = 3600;

/** Grava a foto em `{userId}/{uuid}.{ext}` (nome novo a cada envio) e devolve o caminho. */
export async function uploadAvatar(
  supabase: SupabaseClient,
  userId: string,
  bytes: Uint8Array,
  type: AvatarType,
): Promise<string> {
  const path = `${userId}/${crypto.randomUUID()}.${extensionFor(type)}`;
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, bytes, { contentType: type, upsert: false });
  if (error) {
    throw new Error(`Falha ao enviar a foto: ${error.message}`);
  }
  return path;
}

/** Apaga uma foto. Falhas só são registradas: um arquivo órfão não é visível para ninguém. */
export async function removeAvatar(supabase: SupabaseClient, path: string): Promise<void> {
  const { error } = await supabase.storage.from(AVATAR_BUCKET).remove([path]);
  if (error) {
    console.error("Falha ao apagar a foto do perfil:", error.message);
  }
}

/** URL assinada (1 h) para exibir a foto; null quando não for possível gerá-la. */
export async function getAvatarSignedUrl(
  supabase: SupabaseClient,
  path: string,
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error || !data) {
    console.error("Falha ao gerar a URL da foto do perfil:", error?.message);
    return null;
  }
  return data.signedUrl;
}
