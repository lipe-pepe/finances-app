import { z } from "zod";

// Divisão da receita: porcentagem inteira (0–100) destinada a gastos essenciais
export const allocationSchema = z.object({
  essentialPercentage: z
    .number({ error: "Porcentagem inválida." })
    .int("A porcentagem deve ser um número inteiro.")
    .min(0, "A porcentagem mínima é 0%.")
    .max(100, "A porcentagem máxima é 100%."),
});

export type AllocationInput = z.input<typeof allocationSchema>;
