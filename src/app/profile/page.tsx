import type { Metadata } from "next";
import { AppHeader } from "@/features/planning/components/app-header";
import { ProfileEditor } from "@/features/profile/components/profile-editor";
import { PROFILE_TITLE } from "@/features/profile/labels";
import { getProfile } from "@/features/profile/queries";
import { requireUserId } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Perfil · Finanças Pessoais",
};

// Página de perfil (feature 005): dados do usuário logado, renderizados no servidor a cada
// requisição. Sem sessão, o proxy redireciona para o login (FR-009). O cabeçalho não destaca
// nenhuma seção, pois o perfil é acessado pelo menu do avatar.
export default async function ProfilePage() {
  const userId = await requireUserId();
  const profile = await getProfile(userId);

  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 tablet:px-6 tablet:py-10">
        <h1 className="text-3xl font-bold tracking-tight">{PROFILE_TITLE}</h1>
        <ProfileEditor profile={profile} />
      </main>
    </>
  );
}
