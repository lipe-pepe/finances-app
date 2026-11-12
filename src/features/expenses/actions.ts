"use server";

import { revalidatePath } from "next/cache";
import { CONTROL_PATH, PLANNING_PATH } from "@/lib/app-routes";
import { fail, fieldError, ok, validationError, type ActionResult } from "@/lib/action-result";
import { MISSING_CATEGORY_MESSAGE, categoryExists } from "@/lib/category";
import { centsToDecimalString } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { authenticatedAction, isValidId } from "@/lib/server-action";
import { expenseSchema, type ExpenseInput } from "@/features/expenses/schemas";

export async function createExpense(input: ExpenseInput): Promise<ActionResult<{ id: string }>> {
  return authenticatedAction(async (userId) => {
    const parsed = expenseSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);
    if (!(await categoryExists(parsed.data.categoryId))) {
      return fieldError("categoryId", MISSING_CATEGORY_MESSAGE);
    }

    const expense = await prisma.expense.create({
      data: {
        userId,
        name: parsed.data.name,
        amount: centsToDecimalString(parsed.data.amount),
        categoryId: parsed.data.categoryId,
        part: parsed.data.part,
      },
      select: { id: true },
    });
    // O planejado por categoria também aparece no Controle
    revalidatePath(PLANNING_PATH);
    revalidatePath(CONTROL_PATH);
    return ok({ id: expense.id });
  });
}

export async function updateExpense(
  id: string,
  input: ExpenseInput,
): Promise<ActionResult<{ id: string }>> {
  return authenticatedAction(async (userId) => {
    if (!isValidId(id)) return fail({ code: "NOT_FOUND" });
    const parsed = expenseSchema.safeParse(input);
    if (!parsed.success) return validationError(parsed.error);
    if (!(await categoryExists(parsed.data.categoryId))) {
      return fieldError("categoryId", MISSING_CATEGORY_MESSAGE);
    }

    // Filtro por userId: gasto de outro usuário resulta em NOT_FOUND
    const { count } = await prisma.expense.updateMany({
      where: { id, userId },
      data: {
        name: parsed.data.name,
        amount: centsToDecimalString(parsed.data.amount),
        categoryId: parsed.data.categoryId,
        part: parsed.data.part,
      },
    });
    if (count === 0) return fail({ code: "NOT_FOUND" });

    // O planejado por categoria também aparece no Controle
    revalidatePath(PLANNING_PATH);
    revalidatePath(CONTROL_PATH);
    return ok({ id });
  });
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  return authenticatedAction(async (userId) => {
    if (!isValidId(id)) return fail({ code: "NOT_FOUND" });

    const { count } = await prisma.expense.deleteMany({ where: { id, userId } });
    if (count === 0) return fail({ code: "NOT_FOUND" });

    // O planejado por categoria também aparece no Controle
    revalidatePath(PLANNING_PATH);
    revalidatePath(CONTROL_PATH);
    return ok();
  });
}
