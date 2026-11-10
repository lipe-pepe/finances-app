import { PieChart } from "lucide-react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/login-form";
import { getCurrentUserId } from "@/lib/auth";
import { HOME_PATH } from "@/lib/auth-redirect";

export default async function LoginPage() {
  // Usuário já logado não precisa ver o login
  if (await getCurrentUserId()) {
    redirect(HOME_PATH);
  }

  return (
    <main className="flex min-h-svh flex-1 items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-sm flex-col gap-7">
        <div className="flex flex-col items-center gap-3.5 text-center">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
          >
            <PieChart className="size-6" strokeWidth={2.2} />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Finanças Pessoais</h1>
            <p className="text-muted-foreground">
              Entre com seu email e senha para acessar seu planejamento.
            </p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <LoginForm />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          O acesso é criado pelo administrador da plataforma.
        </p>
      </div>
    </main>
  );
}
