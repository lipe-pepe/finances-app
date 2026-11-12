import { revalidatePath } from "next/cache";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestUsers, getAnyCategory, prisma, resetDatabase, type TestUsers } from "../setup/db";
import { mockAuthenticatedUser } from "../setup/mocks";

vi.mock("@/lib/auth", async () => (await import("../setup/mocks")).authModuleMock);

import { createExpense, deleteExpense, updateExpense } from "@/features/expenses/actions";

const MISSING_CATEGORY_ID = "00000000-0000-4000-8000-000000000000";

describe("Server Actions de gastos essenciais", () => {
  let users: TestUsers;
  let categoryId: string;

  beforeAll(async () => {
    users = await createTestUsers();
    categoryId = (await getAnyCategory()).id;
  });

  beforeEach(async () => {
    await resetDatabase();
    vi.mocked(revalidatePath).mockClear();
    mockAuthenticatedUser(users.userA);
  });

  it("cria um gasto com categoria", async () => {
    const result = await createExpense({ name: "Aluguel", amount: "1.500,00", categoryId, part: "essentials" });
    expect(result.ok).toBe(true);
    const rows = await prisma.expense.findMany();
    expect(rows).toEqual([
      expect.objectContaining({ userId: users.userA, name: "Aluguel", categoryId }),
    ]);
    expect(rows[0].amount.toString()).toBe("1500");
    expect(revalidatePath).toHaveBeenCalledWith("/planning");
    expect(revalidatePath).toHaveBeenCalledWith("/control");
  });

  it("retorna VALIDATION em categoryId quando a categoria não existe", async () => {
    const result = await createExpense({
      name: "Aluguel",
      amount: "10",
      categoryId: MISSING_CATEGORY_ID,
      part: "essentials",
    });
    expect(result).toEqual({
      ok: false,
      error: { code: "VALIDATION", fieldErrors: { categoryId: ["Categoria inexistente."] } },
    });
    expect(await prisma.expense.count()).toBe(0);
  });

  it("retorna VALIDATION sem categoria", async () => {
    const result = await createExpense({ name: "Aluguel", amount: "10", categoryId: "", part: "essentials" });
    expect(result).toMatchObject({ ok: false, error: { code: "VALIDATION" } });
  });

  it("retorna UNAUTHENTICATED sem sessão", async () => {
    mockAuthenticatedUser(null);
    await expect(createExpense({ name: "Aluguel", amount: "10", categoryId, part: "essentials" })).resolves.toEqual({
      ok: false,
      error: { code: "UNAUTHENTICATED" },
    });
    await expect(updateExpense(MISSING_CATEGORY_ID, { name: "X", amount: "1", categoryId, part: "essentials" })).resolves.toEqual({
      ok: false,
      error: { code: "UNAUTHENTICATED" },
    });
    await expect(deleteExpense(MISSING_CATEGORY_ID)).resolves.toEqual({
      ok: false,
      error: { code: "UNAUTHENTICATED" },
    });
  });

  it("edita todos os campos de um gasto", async () => {
    const other = await getAnyCategory("Alimentação");
    const expense = await prisma.expense.create({
      data: { userId: users.userA, name: "Aluguel", amount: "1500.00", categoryId },
    });
    const result = await updateExpense(expense.id, {
      name: "Mercado",
      amount: "450,75",
      categoryId: other.id,
      part: "essentials",
    });
    expect(result).toEqual({ ok: true, data: { id: expense.id } });
    const row = await prisma.expense.findUniqueOrThrow({ where: { id: expense.id } });
    expect(row).toMatchObject({ name: "Mercado", categoryId: other.id });
    expect(row.amount.toString()).toBe("450.75");
  });

  it("apaga um gasto", async () => {
    const expense = await prisma.expense.create({
      data: { userId: users.userA, name: "Aluguel", amount: "1500.00", categoryId },
    });
    await expect(deleteExpense(expense.id)).resolves.toEqual({ ok: true, data: undefined });
    expect(await prisma.expense.count()).toBe(0);
  });

  it("retorna NOT_FOUND ao alterar ou apagar gasto de outro usuário", async () => {
    const expenseOfB = await prisma.expense.create({
      data: { userId: users.userB, name: "Gasto de B", amount: "10.00", categoryId },
    });
    await expect(
      updateExpense(expenseOfB.id, { name: "Invadido", amount: "1", categoryId, part: "essentials" }),
    ).resolves.toEqual({ ok: false, error: { code: "NOT_FOUND" } });
    await expect(deleteExpense(expenseOfB.id)).resolves.toEqual({
      ok: false,
      error: { code: "NOT_FOUND" },
    });
    const row = await prisma.expense.findUniqueOrThrow({ where: { id: expenseOfB.id } });
    expect(row.name).toBe("Gasto de B");
  });

  it("grava e troca a parte do gasto (feature 006, FR-011)", async () => {
    const created = await createExpense({ name: "Curso", amount: "400", categoryId, part: "education" });
    expect(created.ok).toBe(true);
    const id = created.ok ? created.data.id : "";
    await expect(prisma.expense.findUnique({ where: { id } })).resolves.toMatchObject({ part: "education" });

    await updateExpense(id, { name: "Curso", amount: "400", categoryId, part: "free" });
    await expect(prisma.expense.findUnique({ where: { id } })).resolves.toMatchObject({ part: "free" });
  });

  it("retorna VALIDATION em part para parte inválida (FR-022)", async () => {
    const result = await createExpense({
      name: "Curso",
      amount: "400",
      categoryId,
      part: "outra" as "free",
    });
    expect(result).toMatchObject({ ok: false, error: { code: "VALIDATION", fieldErrors: { part: ["Selecione a parte."] } } });
    expect(await prisma.expense.count()).toBe(0);
  });
});
