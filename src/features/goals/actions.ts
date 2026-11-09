"use server";

import { revalidatePath } from "next/cache";
import { fail, fieldError, ok, validationError, type ActionResult } from "@/lib/action-result";
import { MISSING_CATEGORY_MESSAGE, categoryExists } from "@/lib/category";
import { centsToDecimalString } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { authenticatedAction, isValidId } from "@/lib/server-action";
import { goalSchema, type GoalInput } from "@/features/goals/schemas";

export async function createGoal(input: GoalInput): Promise<ActionResult<{ id: string }>> {
  return authenticatedAction(async (userId) => {
    const parsed = goalSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);
    const { categoryId } = parsed.data;
    // A categoria é opcional; só é verificada quando informada
    if (categoryId && !(await categoryExists(categoryId))) {
      return fieldError("categoryId", MISSING_CATEGORY_MESSAGE);
    }

    const goal = await prisma.goal.create({
      data: {
        userId,
        name: parsed.data.name,
        amount: centsToDecimalString(parsed.data.amount),
        categoryId,
      },
      select: { id: true },
    });
    revalidatePath("/");
    return ok({ id: goal.id });
  });
}

export async function updateGoal(id: string, input: GoalInput): Promise<ActionResult<{ id: string }>> {
  return authenticatedAction(async (userId) => {
    if (!isValidId(id)) return fail({ code: "NOT_FOUND" });
    const parsed = goalSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);
    const { categoryId } = parsed.data;
    if (categoryId && !(await categoryExists(categoryId))) {
      return fieldError("categoryId", MISSING_CATEGORY_MESSAGE);
    }

    // Filtro por userId: meta de outro usuário resulta em NOT_FOUND
    const { count } = await prisma.goal.updateMany({
      where: { id, userId },
      data: {
        name: parsed.data.name,
        amount: centsToDecimalString(parsed.data.amount),
        categoryId,
      },
    });
    if (count === 0) return fail({ code: "NOT_FOUND" });

    revalidatePath("/");
    return ok({ id });
  });
}

export async function deleteGoal(id: string): Promise<ActionResult> {
  return authenticatedAction(async (userId) => {
    if (!isValidId(id)) return fail({ code: "NOT_FOUND" });

    const { count } = await prisma.goal.deleteMany({ where: { id, userId } });
    if (count === 0) return fail({ code: "NOT_FOUND" });

    revalidatePath("/");
    return ok();
  });
}
