import { SignOutButton } from "@/features/auth/components/sign-out-button";

/** Cabeçalho da área logada, com o título e o botão de sair (FR-004). */
export function AppHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <h1 className="text-lg font-semibold">Finanças Pessoais</h1>
        <SignOutButton />
      </div>
    </header>
  );
}
