import { z } from "zod";

// Divisão da receita: porcentagem inteira (0–100) destinada ao Momento Presente
export const allocationSchema = z.object({
  essentialPercentage: z
    .number({ error: "Porcentagem inválida." })
    .int("A porcentagem deve ser um número inteiro.")
    .min(0, "A porcentagem mínima é 0%.")
    .max(100, "A porcentagem máxima é 100%."),
});

export type AllocationInput = z.input<typeof allocationSchema>;

// Divisão do Momento Presente (feature 006): Educação e Livre em porcentagens inteiras da Receita.
// Gastos Essenciais é derivado; a soma Educação + Livre ≤ Momento Presente é validada na action.
const partPercentageSchema = z
  .number({ error: "Porcentagem inválida." })
  .int("Porcentagem inválida.")
  .min(0, "Porcentagem inválida.");

export const PRESENT_SPLIT_EXCEEDED_MESSAGE = "A soma das partes não pode passar do Momento Presente.";

export const presentSplitSchema = z.object({
  educationPercentage: partPercentageSchema,
  freePercentage: partPercentageSchema,
});

export type PresentSplitInput = z.input<typeof presentSplitSchema>;
