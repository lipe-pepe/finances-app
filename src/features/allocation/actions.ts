"use server";

import { fieldError, ok, validationError, type ActionResult } from "@/lib/action-result";
import { DEFAULT_ESSENTIAL_PERCENTAGE } from "@/lib/planning";
import { prisma } from "@/lib/prisma";
import { rescaleParts, toPartPercentages, type PartPercentages } from "@/lib/present-parts";
import { authenticatedAction } from "@/lib/server-action";
import {
  PRESENT_SPLIT_EXCEEDED_MESSAGE,
  allocationSchema,
  presentSplitSchema,
  type AllocationInput,
  type PresentSplitInput,
} from "@/features/allocation/schemas";

/** Partes gravadas do usuário (ou o padrão: 50% de Momento Presente, tudo em Gastos Essenciais). */
async function readCurrentSplit(userId: string): Promise<{ present: number; parts: PartPercentages }> {
  const row = await prisma.allocation.findUnique({ where: { userId } });
  const present = row?.essentialPercentage ?? DEFAULT_ESSENTIAL_PERCENTAGE;
  return {
    present,
    parts: toPartPercentages(present, row?.educationPercentage ?? 0, row?.freePercentage ?? 0),
  };
}

/**
 * Salva a divisão da receita (upsert por usuário; a última gravação prevalece) e reajusta as
 * partes do Momento Presente na mesma proporção (feature 006, FR-008). O reajuste é calculado
 * aqui a partir das partes gravadas, nunca recebido do cliente.
 * Não chama revalidatePath: o cliente já tem o valor, e revalidar poderia sobrescrever o slider
 * durante um novo arraste (exceção documentada no contrato).
 */
export async function saveAllocation(
  input: AllocationInput,
): Promise<ActionResult<{ essentialPercentage: number; parts: PartPercentages }>> {
  return authenticatedAction(async (userId) => {
    const parsed = allocationSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);

    const { essentialPercentage } = parsed.data;
    const current = await readCurrentSplit(userId);
    const parts = rescaleParts(current.parts, essentialPercentage);
    const data = {
      essentialPercentage,
      educationPercentage: parts.education,
      freePercentage: parts.free,
    };
    await prisma.allocation.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
    return ok({ essentialPercentage, parts });
  });
}

/**
 * Salva a divisão do Momento Presente em partes (feature 006, FR-005). Gastos Essenciais é
 * derivado; Educação + Livre não pode passar do Momento Presente gravado (FR-003, FR-022).
 * Sem revalidatePath, pelo mesmo motivo de saveAllocation.
 */
export async function savePresentSplit(
  input: PresentSplitInput,
): Promise<ActionResult<{ parts: PartPercentages }>> {
  return authenticatedAction(async (userId) => {
    const parsed = presentSplitSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);

    const { educationPercentage, freePercentage } = parsed.data;
    const { present } = await readCurrentSplit(userId);
    if (educationPercentage + freePercentage > present) {
      return fieldError("freePercentage", PRESENT_SPLIT_EXCEEDED_MESSAGE);
    }

    await prisma.allocation.upsert({
      where: { userId },
      create: { userId, essentialPercentage: present, educationPercentage, freePercentage },
      update: { educationPercentage, freePercentage },
    });
    return ok({ parts: toPartPercentages(present, educationPercentage, freePercentage) });
  });
}
