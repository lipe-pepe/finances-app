import { z } from "zod";
import { amountSchema, categoryIdSchema, nameSchema } from "@/lib/validation";

// Gasto essencial: nome, valor e categoria obrigatória
export const expenseSchema = z.object({
  name: nameSchema,
  amount: amountSchema,
  categoryId: categoryIdSchema,
});

export type ExpenseInput = z.input<typeof expenseSchema>;
