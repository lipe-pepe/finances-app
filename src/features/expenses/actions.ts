"use server";

import { revalidatePath } from "next/cache";
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
      },
      select: { id: true },
    });
    revalidatePath("/");
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
      },
    });
    if (count === 0) return fail({ code: "NOT_FOUND" });

    revalidatePath("/");
    return ok({ id });
  });
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  return authenticatedAction(async (userId) => {
    if (!isValidId(id)) return fail({ code: "NOT_FOUND" });

    const { count } = await prisma.expense.deleteMany({ where: { id, userId } });
    if (count === 0) return fail({ code: "NOT_FOUND" });

    revalidatePath("/");
    return ok();
  });
}
