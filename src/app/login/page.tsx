import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";
import { getCurrentUserId } from "@/lib/auth";
import { HOME_PATH } from "@/lib/auth-redirect";

export default async function LoginPage() {
  // Usuário já logado não precisa ver o login
  if (await getCurrentUserId()) {
    redirect(HOME_PATH);
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Finanças Pessoais</CardTitle>
          <CardDescription>Entre com seu email e senha para acessar seu planejamento.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
