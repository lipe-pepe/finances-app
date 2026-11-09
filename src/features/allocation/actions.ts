"use server";

import { ok, validationError, type ActionResult } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { authenticatedAction } from "@/lib/server-action";
import { allocationSchema, type AllocationInput } from "@/features/allocation/schemas";

/**
 * Salva a divisão da receita (upsert por usuário; a última gravação prevalece).
 * Não chama revalidatePath: o cliente já tem o valor, e revalidar poderia sobrescrever o slider
 * durante um novo arraste (exceção documentada no contrato).
 */
export async function saveAllocation(
  input: AllocationInput,
): Promise<ActionResult<{ essentialPercentage: number }>> {
  return authenticatedAction(async (userId) => {
    const parsed = allocationSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);

    const { essentialPercentage } = parsed.data;
    await prisma.allocation.upsert({
      where: { userId },
      create: { userId, essentialPercentage },
      update: { essentialPercentage },
    });
    return ok({ essentialPercentage });
  });
}
