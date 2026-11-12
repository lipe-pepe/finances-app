import "server-only";
import { prisma } from "@/lib/prisma";
import { decimalToCents } from "@/lib/money";
import { DEFAULT_ESSENTIAL_PERCENTAGE, sumCents } from "@/lib/planning";
import { sumByPart, type PartCents, type PresentPart } from "@/lib/present-parts";

// Dados da tela de planejamento já convertidos para tipos serializáveis (centavos em number),
// prontos para Server e Client Components.

export type IncomeItem = { id: string; name: string; amountCents: number };
export type CategoryOption = { id: string; name: string };
export type ExpenseItem = {
  id: string;
  name: string;
  amountCents: number;
  categoryId: string;
  categoryName: string;
  /** Parte do Momento Presente (feature 006) */
  part: PresentPart;
};
export type GoalItem = {
  id: string;
  name: string;
  amountCents: number;
  categoryId: string | null;
  categoryName: string | null;
};

export type PlanningData = {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  goals: GoalItem[];
  categories: CategoryOption[];
  essentialPercentage: number;
  /** Partes do Momento Presente (feature 006); Gastos Essenciais é derivado */
  educationPercentage: number;
  freePercentage: number;
  revenueCents: number;
  expensesTotalCents: number;
  /** Soma dos gastos planejados por parte (feature 006, FR-013) */
  expensesTotalCentsByPart: PartCents;
  goalsTotalCents: number;
};

/** Lê todos os dados do planejamento de um usuário. Toda consulta é filtrada por userId. */
export async function getPlanningData(userId: string): Promise<PlanningData> {
  const [incomeRows, expenseRows, goalRows, categoryRows, allocation] = await Promise.all([
    prisma.income.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.expense.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      include: { category: true },
    }),
    prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.allocation.findUnique({ where: { userId } }),
  ]);

  const incomes = incomeRows.map((row) => ({
    id: row.id,
    name: row.name,
    amountCents: decimalToCents(row.amount),
  }));
  const expenses = expenseRows.map((row) => ({
    id: row.id,
    name: row.name,
    amountCents: decimalToCents(row.amount),
    categoryId: row.categoryId,
    categoryName: row.category.name,
    part: row.part,
  }));
  const goals = goalRows.map((row) => ({
    id: row.id,
    name: row.name,
    amountCents: decimalToCents(row.amount),
    categoryId: row.categoryId,
    categoryName: row.category?.name ?? null,
  }));
  // Ordenação final em pt-BR para não depender da collation do banco
  const categories = categoryRows
    .map((row) => ({ id: row.id, name: row.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return {
    incomes,
    expenses,
    goals,
    categories,
    essentialPercentage: allocation?.essentialPercentage ?? DEFAULT_ESSENTIAL_PERCENTAGE,
    educationPercentage: allocation?.educationPercentage ?? 0,
    freePercentage: allocation?.freePercentage ?? 0,
    revenueCents: sumCents(incomes.map((income) => income.amountCents)),
    expensesTotalCents: sumCents(expenses.map((expense) => expense.amountCents)),
    expensesTotalCentsByPart: sumByPart(expenses),
    goalsTotalCents: sumCents(goals.map((goal) => goal.amountCents)),
  };
}
