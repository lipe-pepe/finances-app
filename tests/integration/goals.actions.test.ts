import { revalidatePath } from "next/cache";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestUsers, getAnyCategory, prisma, resetDatabase, type TestUsers } from "../setup/db";
import { mockAuthenticatedUser } from "../setup/mocks";

vi.mock("@/lib/auth", async () => (await import("../setup/mocks")).authModuleMock);

import { createGoal, deleteGoal, updateGoal } from "@/features/goals/actions";

const MISSING_ID = "00000000-0000-4000-8000-000000000000";

describe("Server Actions de metas futuras", () => {
  let users: TestUsers;
  let categoryId: string;

  beforeAll(async () => {
    users = await createTestUsers();
    categoryId = (await getAnyCategory("Viagem")).id;
  });

  beforeEach(async () => {
    await resetDatabase();
    vi.mocked(revalidatePath).mockClear();
    mockAuthenticatedUser(users.userA);
  });

  it("cria uma meta sem categoria", async () => {
    const result = await createGoal({ name: "Viagem", amount: "500" });
    expect(result.ok).toBe(true);
    const rows = await prisma.goal.findMany();
    expect(rows).toEqual([
      expect.objectContaining({ userId: users.userA, name: "Viagem", categoryId: null }),
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("cria uma meta com categoria", async () => {
    await createGoal({ name: "Viagem", amount: "500", categoryId });
    const row = await prisma.goal.findFirstOrThrow();
    expect(row.categoryId).toBe(categoryId);
  });

  it("retorna VALIDATION quando a categoria informada não existe", async () => {
    const result = await createGoal({ name: "Viagem", amount: "500", categoryId: MISSING_ID });
    expect(result).toEqual({
      ok: false,
      error: { code: "VALIDATION", fieldErrors: { categoryId: ["Categoria inexistente."] } },
    });
    expect(await prisma.goal.count()).toBe(0);
  });

  it("edita uma meta removendo a categoria", async () => {
    const goal = await prisma.goal.create({
      data: { userId: users.userA, name: "Viagem", amount: "500.00", categoryId },
    });
    const result = await updateGoal(goal.id, { name: "Viagem longa", amount: "800", categoryId: null });
    expect(result).toEqual({ ok: true, data: { id: goal.id } });
    const row = await prisma.goal.findUniqueOrThrow({ where: { id: goal.id } });
    expect(row).toMatchObject({ name: "Viagem longa", categoryId: null });
    expect(row.amount.toString()).toBe("800");
  });

  it("apaga uma meta", async () => {
    const goal = await prisma.goal.create({
      data: { userId: users.userA, name: "Viagem", amount: "500.00" },
    });
    await expect(deleteGoal(goal.id)).resolves.toEqual({ ok: true, data: undefined });
    expect(await prisma.goal.count()).toBe(0);
  });

  it("retorna UNAUTHENTICATED sem sessão", async () => {
    mockAuthenticatedUser(null);
    for (const result of [
      await createGoal({ name: "Viagem", amount: "500" }),
      await updateGoal(MISSING_ID, { name: "Viagem", amount: "500" }),
      await deleteGoal(MISSING_ID),
    ]) {
      expect(result).toEqual({ ok: false, error: { code: "UNAUTHENTICATED" } });
    }
  });

  it("retorna NOT_FOUND ao alterar ou apagar meta de outro usuário", async () => {
    const goalOfB = await prisma.goal.create({
      data: { userId: users.userB, name: "Meta de B", amount: "1.00" },
    });
    await expect(updateGoal(goalOfB.id, { name: "Invadida", amount: "1" })).resolves.toEqual({
      ok: false,
      error: { code: "NOT_FOUND" },
    });
    await expect(deleteGoal(goalOfB.id)).resolves.toEqual({
      ok: false,
      error: { code: "NOT_FOUND" },
    });
    expect((await prisma.goal.findUniqueOrThrow({ where: { id: goalOfB.id } })).name).toBe(
      "Meta de B",
    );
  });
});
