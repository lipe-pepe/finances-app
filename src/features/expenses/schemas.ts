import { z } from "zod";
import { amountSchema, nameSchema } from "@/lib/validation";

// Gasto essencial: nome, valor e categoria obrigatória
export const expenseSchema = z.object({
  name: nameSchema,
  amount: amountSchema,
  categoryId: z
    .string({ error: "Selecione uma categoria." })
    .min(1, "Selecione uma categoria.")
    .pipe(z.uuid("Selecione uma categoria.")),
});

export type ExpenseInput = z.input<typeof expenseSchema>;
