"use server";

import { revalidatePath } from "next/cache";
import { PLANNING_PATH } from "@/lib/app-routes";
import { fail, ok, validationError, type ActionResult } from "@/lib/action-result";
import { centsToDecimalString } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { authenticatedAction, isValidId } from "@/lib/server-action";
import { incomeSchema, type IncomeInput } from "@/features/incomes/schemas";

export async function createIncome(input: IncomeInput): Promise<ActionResult<{ id: string }>> {
  return authenticatedAction(async (userId) => {
    const parsed = incomeSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);

    const income = await prisma.income.create({
      data: { userId, name: parsed.data.name, amount: centsToDecimalString(parsed.data.amount) },
      select: { id: true },
    });
    revalidatePath(PLANNING_PATH);
    return ok({ id: income.id });
  });
}

export async function updateIncome(
  id: string,
  input: IncomeInput,
): Promise<ActionResult<{ id: string }>> {
  return authenticatedAction(async (userId) => {
    if (!isValidId(id)) return fail({ code: "NOT_FOUND" });
    const parsed = incomeSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);

    // Filtro por userId: um id de outro usuário resulta em 0 linhas alteradas (NOT_FOUND)
    const { count } = await prisma.income.updateMany({
      where: { id, userId },
      data: { name: parsed.data.name, amount: centsToDecimalString(parsed.data.amount) },
    });
    if (count === 0) return fail({ code: "NOT_FOUND" });

    revalidatePath(PLANNING_PATH);
    return ok({ id });
  });
}

export async function deleteIncome(id: string): Promise<ActionResult> {
  return authenticatedAction(async (userId) => {
    if (!isValidId(id)) return fail({ code: "NOT_FOUND" });

    const { count } = await prisma.income.deleteMany({ where: { id, userId } });
    if (count === 0) return fail({ code: "NOT_FOUND" });

    revalidatePath(PLANNING_PATH);
    return ok();
  });
}
