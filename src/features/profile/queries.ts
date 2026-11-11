import "server-only";
import { cache } from "react";
import { getDisplayName, getInitials } from "@/lib/initials";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAvatarSignedUrl } from "@/features/profile/avatar-storage";

/** Dados do perfil para o cabeçalho e a página de perfil (data-model.md). */
export type ProfileView = {
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;
  initials: string;
  displayName: string;
};

/**
 * Perfil do usuário autenticado. `cache()` evita consultar duas vezes na mesma requisição
 * (cabeçalho e página). Sem linha em `profiles`, devolve um perfil vazio (contas existentes).
 */
export const getProfile = cache(async (userId: string): Promise<ProfileView> => {
  const supabase = await createSupabaseServerClient();
  const [profile, { data }] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    supabase.auth.getUser(),
  ]);

  // O email vem sempre do Supabase Auth; esta feature nunca o altera (FR-016)
  const email = data.user?.email ?? "";
  const firstName = profile?.firstName ?? null;
  const lastName = profile?.lastName ?? null;
  const avatarUrl = profile?.avatarPath
    ? await getAvatarSignedUrl(supabase, profile.avatarPath)
    : null;

  const names = { firstName, lastName, email };
  return {
    firstName,
    lastName,
    email,
    avatarUrl,
    initials: getInitials(names),
    displayName: getDisplayName(names),
  };
});
