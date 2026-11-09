import { z } from "zod";

// Credenciais de login (validadas no formulário e novamente na Server Action)
export const signInSchema = z.object({
  email: z.string().trim().pipe(z.email("Informe um email válido.")),
  password: z.string().min(1, "Informe a senha."),
});

export type SignInInput = z.input<typeof signInSchema>;
