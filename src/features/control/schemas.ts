import { z } from "zod";
import { isInMonth, isValidCalendarDate } from "@/lib/calendar";
import { DATE_OUT_OF_MONTH_MESSAGE } from "@/lib/control-labels";
import { amountSchema, categoryIdSchema, nameSchema } from "@/lib/validation";

/**
 * Gasto realizado (Controle): nome, valor, categoria e data, todos obrigatórios.
 * A data precisa estar no mês de `today` (FR-009); por isso o schema é criado com o "hoje"
 * calculado no momento da validação, no cliente e no servidor.
 */
export function createActualExpenseSchema(today: string) {
  return z.object({
    name: nameSchema,
    amount: amountSchema,
    categoryId: categoryIdSchema,
    spentOn: z.string({ error: "Informe a data." }).superRefine((value, ctx) => {
      // Uma mensagem por vez: vazio → formato/dia inexistente → fora do mês
      if (value.trim() === "") {
        ctx.addIssue({ code: "custom", message: "Informe a data." });
      } else if (!isValidCalendarDate(value)) {
        ctx.addIssue({ code: "custom", message: "Data inválida." });
      } else if (!isInMonth(value, today)) {
        ctx.addIssue({ code: "custom", message: DATE_OUT_OF_MONTH_MESSAGE });
      }
    }),
  });
}

export type ActualExpenseInput = z.input<ReturnType<typeof createActualExpenseSchema>>;
