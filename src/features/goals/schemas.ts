import { z } from "zod";
import { amountSchema, nameSchema } from "@/lib/validation";

/** Valor da opção "Sem categoria" no seletor (o Radix Select não aceita valor vazio). */
export const NO_CATEGORY = "none";

// Meta futura: nome, valor e categoria opcional (vazia/"sem categoria" vira null)
export const goalSchema = z.object({
  name: nameSchema,
  amount: amountSchema,
  categoryId: z
    .union([z.literal(""), z.literal(NO_CATEGORY), z.uuid(), z.null()], {
      error: "Categoria inválida.",
    })
    .optional()
    .transform((value) => (value && value !== NO_CATEGORY ? value : null)),
});

export type GoalInput = z.input<typeof goalSchema>;
