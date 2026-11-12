import "server-only";
import type { CategoryOption } from "@/features/planning/queries";
import { fromDbDate, getMonthRange, toDbDate } from "@/lib/calendar";
import { decimalToCents } from "@/lib/money";
import { DEFAULT_ESSENTIAL_PERCENTAGE, calculatePlannedCents, sumCents } from "@/lib/planning";
import { prisma } from "@/lib/prisma";
import {
  getPartCents,
  toPartPercentages,
  type PartCents,
  type PartPercentages,
  type PresentPart,
} from "@/lib/present-parts";

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
  /** Parte do Momento Presente (feature 006) */
  part: PresentPart;
};

export type ControlData = {
  /** Dia de hoje no fuso da aplicação */
  today: string;
  categories: CategoryOption[];
  /** Gastos realizados do mês de `today`, mais recentes primeiro (FR-016, FR-021) */
  actualExpenses: ActualExpenseItem[];
  /** Porcentagem da Receita destinada ao Momento Presente */
  presentPercentage: number;
  /** Porcentagens das partes (somam presentPercentage) */
  partPercentages: PartPercentages;
  /** Limite de todo o Momento Presente: Receita × Momento Presente (feature 006, FR-029) */
  presentLimitCents: number;
  /** Limite de cada parte: Receita × porcentagem da parte (feature 006, FR-018) */
  partLimitCents: PartCents;
};

/** Lê os dados do Controle de um usuário para o mês de `today`. Toda consulta filtra por userId. */
export async function getControlData(userId: string, today: string): Promise<ControlData> {
  const { first, last } = getMonthRange(today);
  const [actualRows, incomeRows, allocation, categoryRows] = await Promise.all([
    prisma.actualExpense.findMany({
      where: { userId, spentOn: { gte: toDbDate(first), lte: toDbDate(last) } },
      include: { category: true },
      orderBy: [{ spentOn: "desc" }, { createdAt: "desc" }],
    }),
    prisma.income.findMany({ where: { userId }, select: { amount: true } }),
    prisma.allocation.findUnique({ where: { userId } }),
    prisma.category.findMany(),
  ]);

  const revenueCents = sumCents(incomeRows.map((row) => decimalToCents(row.amount)));
  const presentPercentage = allocation?.essentialPercentage ?? DEFAULT_ESSENTIAL_PERCENTAGE;
  const partPercentages = toPartPercentages(
    presentPercentage,
    allocation?.educationPercentage ?? 0,
    allocation?.freePercentage ?? 0,
  );

  return {
    today,
    // Ordenação em pt-BR para não depender da collation do banco
    categories: categoryRows
      .map((row) => ({ id: row.id, name: row.name }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    actualExpenses: actualRows.map((row) => ({
      id: row.id,
      name: row.name,
      amountCents: decimalToCents(row.amount),
      categoryId: row.categoryId,
      categoryName: row.category.name,
      spentOn: fromDbDate(row.spentOn),
      part: row.part,
    })),
    presentPercentage,
    partPercentages,
    presentLimitCents: calculatePlannedCents(revenueCents, presentPercentage),
    partLimitCents: getPartCents(revenueCents, partPercentages),
  };
}
