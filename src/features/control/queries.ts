import "server-only";
import type { CategoryOption } from "@/features/planning/queries";
import { fromDbDate, getMonthRange, toDbDate } from "@/lib/calendar";
import { decimalToCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";

// Dados da página Controle já convertidos para tipos serializáveis (centavos em number e datas
// "YYYY-MM-DD"), prontos para Server e Client Components.

export type ActualExpenseItem = {
  id: string;
  name: string;
  amountCents: number;
  categoryId: string;
  categoryName: string;
  /** Dia do gasto, "YYYY-MM-DD" */
  spentOn: string;
};

export type ControlData = {
  /** Dia de hoje no fuso da aplicação */
  today: string;
  categories: CategoryOption[];
  /** Soma dos gastos planejados (Momento Presente) por categoria; metas não entram (FR-015) */
  plannedCentsByCategory: Record<string, number>;
  /** Gastos realizados do mês de `today`, mais recentes primeiro (FR-016, FR-021) */
  actualExpenses: ActualExpenseItem[];
};

/** Lê os dados do Controle de um usuário para o mês de `today`. Toda consulta filtra por userId. */
export async function getControlData(userId: string, today: string): Promise<ControlData> {
  const { first, last } = getMonthRange(today);
  const [actualRows, plannedGroups, categoryRows] = await Promise.all([
    prisma.actualExpense.findMany({
      where: { userId, spentOn: { gte: toDbDate(first), lte: toDbDate(last) } },
      include: { category: true },
      orderBy: [{ spentOn: "desc" }, { createdAt: "desc" }],
    }),
    prisma.expense.groupBy({
      by: ["categoryId"],
      where: { userId },
      _sum: { amount: true },
    }),
    prisma.category.findMany(),
  ]);

  const plannedCentsByCategory: Record<string, number> = {};
  for (const group of plannedGroups) {
    if (group._sum.amount) {
      plannedCentsByCategory[group.categoryId] = decimalToCents(group._sum.amount);
    }
  }

  return {
    today,
    // Ordenação em pt-BR para não depender da collation do banco
    categories: categoryRows
      .map((row) => ({ id: row.id, name: row.name }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    plannedCentsByCategory,
    actualExpenses: actualRows.map((row) => ({
      id: row.id,
      name: row.name,
      amountCents: decimalToCents(row.amount),
      categoryId: row.categoryId,
      categoryName: row.category.name,
      spentOn: fromDbDate(row.spentOn),
    })),
  };
}
