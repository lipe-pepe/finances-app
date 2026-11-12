import { z } from "zod";
import { amountSchema, categoryIdSchema, nameSchema, presentPartSchema } from "@/lib/validation";

// Gasto do Momento Presente: nome, valor, categoria e parte (feature 006) obrigatórios
export const expenseSchema = z.object({
  name: nameSchema,
  amount: amountSchema,
  categoryId: categoryIdSchema,
  part: presentPartSchema,
});

export type ExpenseInput = z.input<typeof expenseSchema>;

/**
 * Edição de gasto do Momento Presente (feature 007, FR-012): a parte é fixa desde a criação, então
 * não faz parte da edição; um `part` enviado é descartado pelo Zod.
 */
export const expenseUpdateSchema = expenseSchema.omit({ part: true });

export type ExpenseUpdateInput = z.input<typeof expenseUpdateSchema>;
