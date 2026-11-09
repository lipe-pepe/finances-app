import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/actions";

/** Botão "Sair": formulário que chama a Server Action diretamente (sem JavaScript no cliente). */
export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="outline" size="sm">
        Sair
      </Button>
    </form>
  );
}
