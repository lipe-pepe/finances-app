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
