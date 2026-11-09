import { z } from "zod";
import { MAX_AMOUNT_CENTS, parseBrlToCents } from "@/lib/money";

// Schemas base compartilhados entre formulários (cliente) e Server Actions (servidor)

export const NAME_MAX_LENGTH = 100;

/** Nome obrigatório, 1–100 caracteres após remover espaços nas pontas. */
export const nameSchema = z
  .string({ error: "Informe o nome." })
  .trim()
  .min(1, "Informe o nome.")
  .max(NAME_MAX_LENGTH, `O nome deve ter no máximo ${NAME_MAX_LENGTH} caracteres.`);

/**
 * Valor em reais digitado pelo usuário (string), convertido para centavos.
 * Regras: maior que zero, no máximo 2 casas decimais e até R$ 999.999.999,99.
 */
export const amountSchema = z
  .string({ error: "Informe o valor." })
  .trim()
  .min(1, "Informe o valor.")
  .transform((value, ctx) => {
    const cents = parseBrlToCents(value);
    if (cents === null) {
      ctx.addIssue({
        code: "custom",
        message: "Valor inválido. Use números com até 2 casas decimais (ex.: 1.234,56).",
      });
      return z.NEVER;
    }
    if (cents <= 0) {
      ctx.addIssue({ code: "custom", message: "O valor deve ser maior que zero." });
      return z.NEVER;
    }
    if (cents > MAX_AMOUNT_CENTS) {
      ctx.addIssue({ code: "custom", message: "O valor máximo é R$ 999.999.999,99." });
      return z.NEVER;
    }
    return cents;
  });

/** Identificador (uuid) obrigatório. */
export const idSchema = z.uuid("Identificador inválido.");
