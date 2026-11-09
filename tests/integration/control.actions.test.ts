import { revalidatePath } from "next/cache";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createActualExpenseRow,
  createTestUsers,
  getAnyCategory,
  prisma,
  resetDatabase,
  type TestUsers,
} from "../setup/db";
import { mockAuthenticatedUser } from "../setup/mocks";

vi.mock("@/lib/auth", async () => (await import("../setup/mocks")).authModuleMock);

import {
  createActualExpense,
  deleteActualExpense,
  updateActualExpense,
} from "@/features/control/actions";
import { fromDbDate } from "@/lib/calendar";

const MISSING_ID = "00000000-0000-4000-8000-000000000000";
const OUT_OF_MONTH = { code: "VALIDATION", fieldErrors: { spentOn: ["A data deve estar dentro do mês atual."] } };

describe("Server Actions do Controle (gastos realizados)", () => {
  let users: TestUsers;
  let categoryId: string;

  beforeAll(async () => {
    users = await createTestUsers();
    categoryId = (await getAnyCategory()).id;
    // "Hoje" fixo: 09/11/2026 em Brasília; só o Date é simulado, para não travar o Prisma
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-09T15:00:00Z"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(async () => {
    await resetDatabase();
    vi.mocked(revalidatePath).mockClear();
    mockAuthenticatedUser(users.userA);
  });

  it("registra um gasto do usuário logado e revalida o Controle", async () => {
    const result = await createActualExpense({
      name: "Mercado",
      amount: "230,50",
      categoryId,
      spentOn: "2026-11-09",
    });
    expect(result).toMatchObject({ ok: true });
    const rows = await prisma.actualExpense.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ userId: users.userA, name: "Mercado", categoryId });
    expect(rows[0].amount.toString()).toBe("230.5");
    expect(fromDbDate(rows[0].spentOn)).toBe("2026-11-09");
    expect(revalidatePath).toHaveBeenCalledWith("/control");
  });

  it("recusa data fora do mês atual sem gravar nada", async () => {
    const result = await createActualExpense({
      name: "Mercado",
      amount: "10",
      categoryId,
      spentOn: "2026-10-31",
    });
    expect(result).toEqual({ ok: false, error: OUT_OF_MONTH });
    expect(await prisma.actualExpense.count()).toBe(0);
  });

  it("recusa categoria inexistente", async () => {
    const result = await createActualExpense({
      name: "Mercado",
      amount: "10",
      categoryId: MISSING_ID,
      spentOn: "2026-11-09",
    });
    expect(result).toEqual({
      ok: false,
      error: { code: "VALIDATION", fieldErrors: { categoryId: ["Categoria inexistente."] } },
    });
  });

  it("retorna UNAUTHENTICATED sem sessão", async () => {
    mockAuthenticatedUser(null);
    const input = { name: "X", amount: "1", categoryId, spentOn: "2026-11-09" };
    await expect(createActualExpense(input)).resolves.toEqual({
      ok: false,
      error: { code: "UNAUTHENTICATED" },
    });
    await expect(updateActualExpense(MISSING_ID, input)).resolves.toEqual({
      ok: false,
      error: { code: "UNAUTHENTICATED" },
    });
    await expect(deleteActualExpense(MISSING_ID)).resolves.toEqual({
      ok: false,
      error: { code: "UNAUTHENTICATED" },
    });
  });

  it("edita todos os campos do próprio gasto", async () => {
    const other = await getAnyCategory("Alimentação");
    const { id } = await createActualExpenseRow(users.userA, {
      name: "Mercado",
      amountCents: 23050,
      categoryId,
      spentOn: "2026-11-02",
    });
    const result = await updateActualExpense(id, {
      name: "Feira",
      amount: "45,10",
      categoryId: other.id,
      spentOn: "2026-11-08",
    });
    expect(result).toEqual({ ok: true, data: { id } });
    const row = await prisma.actualExpense.findUniqueOrThrow({ where: { id } });
    expect(row).toMatchObject({ name: "Feira", categoryId: other.id });
    expect(row.amount.toString()).toBe("45.1");
    expect(fromDbDate(row.spentOn)).toBe("2026-11-08");
    expect(revalidatePath).toHaveBeenCalledWith("/control");
  });

  it("recusa edição com data fora do mês atual", async () => {
    const { id } = await createActualExpenseRow(users.userA, {
      name: "Mercado",
      amountCents: 1000,
      categoryId,
      spentOn: "2026-11-02",
    });
    await expect(
      updateActualExpense(id, { name: "Mercado", amount: "10", categoryId, spentOn: "2026-12-01" }),
    ).resolves.toEqual({ ok: false, error: OUT_OF_MONTH });
    const row = await prisma.actualExpense.findUniqueOrThrow({ where: { id } });
    expect(fromDbDate(row.spentOn)).toBe("2026-11-02");
  });

  it("apaga o próprio gasto", async () => {
    const { id } = await createActualExpenseRow(users.userA, {
      name: "Mercado",
      amountCents: 1000,
      categoryId,
      spentOn: "2026-11-02",
    });
    await expect(deleteActualExpense(id)).resolves.toEqual({ ok: true, data: undefined });
    expect(await prisma.actualExpense.count()).toBe(0);
    expect(revalidatePath).toHaveBeenCalledWith("/control");
  });

  it("retorna NOT_FOUND para gasto de outro usuário ou id malformado, sem alterar nada", async () => {
    const { id } = await createActualExpenseRow(users.userB, {
      name: "Gasto de B",
      amountCents: 1000,
      categoryId,
      spentOn: "2026-11-02",
    });
    const input = { name: "Invadido", amount: "1", categoryId, spentOn: "2026-11-09" };
    const notFound = { ok: false, error: { code: "NOT_FOUND" } };
    await expect(updateActualExpense(id, input)).resolves.toEqual(notFound);
    await expect(deleteActualExpense(id)).resolves.toEqual(notFound);
    await expect(updateActualExpense("nao-e-uuid", input)).resolves.toEqual(notFound);
    await expect(deleteActualExpense("nao-e-uuid")).resolves.toEqual(notFound);
    const row = await prisma.actualExpense.findUniqueOrThrow({ where: { id } });
    expect(row.name).toBe("Gasto de B");
  });

  it("não cria, altera nem apaga gastos planejados (FR-010)", async () => {
    await prisma.expense.create({
      data: { userId: users.userA, name: "Aluguel", amount: "1500.00", categoryId },
    });
    const created = await createActualExpense({
      name: "Aluguel pago",
      amount: "1.500,00",
      categoryId,
      spentOn: "2026-11-05",
    });
    if (!created.ok) throw new Error("falha ao criar");
    await updateActualExpense(created.data.id, {
      name: "Aluguel pago",
      amount: "1.400,00",
      categoryId,
      spentOn: "2026-11-05",
    });
    await deleteActualExpense(created.data.id);

    const planned = await prisma.expense.findMany();
    expect(planned).toHaveLength(1);
    expect(planned[0]).toMatchObject({ name: "Aluguel" });
    expect(planned[0].amount.toString()).toBe("1500");
  });
});
