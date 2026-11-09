"use server";

import { revalidatePath } from "next/cache";
import { createActualExpenseSchema, type ActualExpenseInput } from "@/features/control/schemas";
import {
  fail,
  fieldError,
  ok,
  validationError,
  type ActionError,
  type ActionResult,
} from "@/lib/action-result";
import { CONTROL_PATH } from "@/lib/app-routes";
import { getToday, toDbDate } from "@/lib/calendar";
import { MISSING_CATEGORY_MESSAGE, categoryExists } from "@/lib/category";
import { centsToDecimalString } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { authenticatedAction, isValidId } from "@/lib/server-action";

// Gastos realizados (Controle). Nenhuma destas actions lê ou altera os gastos planejados (FR-010).

type ActualExpenseData = {
  name: string;
  amount: string;
  categoryId: string;
  spentOn: Date;
};

type ParsedInput =
  | { valid: true; data: ActualExpenseData }
  | { valid: false; failure: { ok: false; error: ActionError } };

/** Valida a entrada com o "hoje" do momento da chamada (cobre a virada do mês). */
async function parseInput(input: ActualExpenseInput): Promise<ParsedInput> {
  const parsed = createActualExpenseSchema(getToday(new Date())).safeParse(input);
  if (!parsed.success) return { valid: false, failure: validationError(parsed.error) };
  if (!(await categoryExists(parsed.data.categoryId))) {
    return { valid: false, failure: fieldError("categoryId", MISSING_CATEGORY_MESSAGE) };
  }
  return {
    valid: true,
    data: {
      name: parsed.data.name,
      amount: centsToDecimalString(parsed.data.amount),
      categoryId: parsed.data.categoryId,
      spentOn: toDbDate(parsed.data.spentOn),
    },
  };
}

export async function createActualExpense(
  input: ActualExpenseInput,
): Promise<ActionResult<{ id: string }>> {
  return authenticatedAction(async (userId) => {
    const parsed = await parseInput(input);
    if (!parsed.valid) return parsed.failure;

    const actualExpense = await prisma.actualExpense.create({
      data: { userId, ...parsed.data },
      select: { id: true },
    });
    revalidatePath(CONTROL_PATH);
    return ok({ id: actualExpense.id });
  });
}

export async function updateActualExpense(
  id: string,
  input: ActualExpenseInput,
): Promise<ActionResult<{ id: string }>> {
  return authenticatedAction(async (userId) => {
    if (!isValidId(id)) return fail({ code: "NOT_FOUND" });
    const parsed = await parseInput(input);
    if (!parsed.valid) return parsed.failure;

    // Filtro por userId: gasto de outro usuário resulta em NOT_FOUND
    const { count } = await prisma.actualExpense.updateMany({
      where: { id, userId },
      data: parsed.data,
    });
    if (count === 0) return fail({ code: "NOT_FOUND" });

    revalidatePath(CONTROL_PATH);
    return ok({ id });
  });
}

export async function deleteActualExpense(id: string): Promise<ActionResult> {
  return authenticatedAction(async (userId) => {
    if (!isValidId(id)) return fail({ code: "NOT_FOUND" });

    const { count } = await prisma.actualExpense.deleteMany({ where: { id, userId } });
    if (count === 0) return fail({ code: "NOT_FOUND" });

    revalidatePath(CONTROL_PATH);
    return ok();
  });
}
