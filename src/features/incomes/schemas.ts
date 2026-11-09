import { z } from "zod";
import { amountSchema, nameSchema } from "@/lib/validation";

// Ganho: nome e valor em reais (texto digitado, convertido para centavos)
export const incomeSchema = z.object({
  name: nameSchema,
  amount: amountSchema,
});

export type IncomeInput = z.input<typeof incomeSchema>;
