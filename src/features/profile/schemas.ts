import { z } from "zod";

// Dados editáveis do perfil (FR-015). O email não faz parte do schema: chaves desconhecidas são
// descartadas pelo Zod, então ele nunca chega à gravação (FR-016/017).

export const PROFILE_NAME_MAX_LENGTH = 50;
const MAX_LENGTH_MESSAGE = `Use no máximo ${PROFILE_NAME_MAX_LENGTH} caracteres.`;

export const profileSchema = z.object({
  firstName: z
    .string({ error: "Informe o nome." })
    .trim()
    .min(1, "Informe o nome.")
    .max(PROFILE_NAME_MAX_LENGTH, MAX_LENGTH_MESSAGE),
  lastName: z
    .string()
    .trim()
    .max(PROFILE_NAME_MAX_LENGTH, MAX_LENGTH_MESSAGE)
    .optional()
    .transform((value) => (value ? value : null)),
});

/** Valores do formulário (texto digitado). */
export type ProfileFormValues = z.input<typeof profileSchema>;

/** Dados validados, prontos para gravar. */
export type ProfileInput = z.output<typeof profileSchema>;
