import { revalidatePath } from "next/cache";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestUsers, prisma, resetDatabase, type TestUsers } from "../setup/db";
import { mockAuthenticatedUser } from "../setup/mocks";

vi.mock("@/lib/auth", async () => (await import("../setup/mocks")).authModuleMock);

import { createIncome, deleteIncome, updateIncome } from "@/features/incomes/actions";

describe("Server Actions de ganhos", () => {
  let users: TestUsers;

  beforeAll(async () => {
    users = await createTestUsers();
  });

  beforeEach(async () => {
    await resetDatabase();
    vi.mocked(revalidatePath).mockClear();
    mockAuthenticatedUser(users.userA);
  });

  describe("createIncome", () => {
    it("persiste o ganho do usuário logado", async () => {
      const result = await createIncome({ name: "Freelance", amount: "1.250,50" });
      expect(result.ok).toBe(true);
      const rows = await prisma.income.findMany();
      expect(rows).toHaveLength(1);
      expect(rows[0].userId).toBe(users.userA);
      expect(rows[0].amount.toString()).toBe("1250.5");
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("retorna VALIDATION e não persiste com entrada inválida", async () => {
      const result = await createIncome({ name: "", amount: "0" });
      expect(result).toMatchObject({ ok: false, error: { code: "VALIDATION" } });
      if (!result.ok && result.error.code === "VALIDATION") {
        expect(Object.keys(result.error.fieldErrors).sort()).toEqual(["amount", "name"]);
      }
      expect(await prisma.income.count()).toBe(0);
    });

    it("retorna UNAUTHENTICATED sem sessão", async () => {
      mockAuthenticatedUser(null);
      const result = await createIncome({ name: "Salário", amount: "100" });
      expect(result).toEqual({ ok: false, error: { code: "UNAUTHENTICATED" } });
      expect(await prisma.income.count()).toBe(0);
    });
  });

  describe("updateIncome", () => {
    it("altera nome e valor", async () => {
      const income = await prisma.income.create({
        data: { userId: users.userA, name: "Salário", amount: "5000.00" },
      });
      const result = await updateIncome(income.id, { name: "Salário novo", amount: "5500" });
      expect(result).toEqual({ ok: true, data: { id: income.id } });
      const row = await prisma.income.findUniqueOrThrow({ where: { id: income.id } });
      expect(row.name).toBe("Salário novo");
      expect(row.amount.toString()).toBe("5500");
    });

    it("retorna NOT_FOUND ao tentar alterar o ganho de outro usuário", async () => {
      const incomeOfB = await prisma.income.create({
        data: { userId: users.userB, name: "Salário de B", amount: "100.00" },
      });
      const result = await updateIncome(incomeOfB.id, { name: "Invadido", amount: "1" });
      expect(result).toEqual({ ok: false, error: { code: "NOT_FOUND" } });
      const row = await prisma.income.findUniqueOrThrow({ where: { id: incomeOfB.id } });
      expect(row.name).toBe("Salário de B");
    });

    it("retorna NOT_FOUND para id inválido", async () => {
      const result = await updateIncome("nao-e-uuid", { name: "X", amount: "1" });
      expect(result).toEqual({ ok: false, error: { code: "NOT_FOUND" } });
    });

    it("retorna VALIDATION com entrada inválida", async () => {
      const income = await prisma.income.create({
        data: { userId: users.userA, name: "Salário", amount: "5000.00" },
      });
      const result = await updateIncome(income.id, { name: "Salário", amount: "abc" });
      expect(result).toMatchObject({ ok: false, error: { code: "VALIDATION" } });
    });

    it("retorna UNAUTHENTICATED sem sessão", async () => {
      mockAuthenticatedUser(null);
      const result = await updateIncome("00000000-0000-0000-0000-000000000000", {
        name: "X",
        amount: "1",
      });
      expect(result).toEqual({ ok: false, error: { code: "UNAUTHENTICATED" } });
    });
  });

  describe("deleteIncome", () => {
    it("apaga o ganho do usuário", async () => {
      const income = await prisma.income.create({
        data: { userId: users.userA, name: "Salário", amount: "5000.00" },
      });
      await expect(deleteIncome(income.id)).resolves.toEqual({ ok: true, data: undefined });
      expect(await prisma.income.count()).toBe(0);
    });

    it("retorna NOT_FOUND ao tentar apagar o ganho de outro usuário", async () => {
      const incomeOfB = await prisma.income.create({
        data: { userId: users.userB, name: "Salário de B", amount: "100.00" },
      });
      await expect(deleteIncome(incomeOfB.id)).resolves.toEqual({
        ok: false,
        error: { code: "NOT_FOUND" },
      });
      expect(await prisma.income.count()).toBe(1);
    });

    it("retorna UNAUTHENTICATED sem sessão", async () => {
      mockAuthenticatedUser(null);
      await expect(deleteIncome("00000000-0000-0000-0000-000000000000")).resolves.toEqual({
        ok: false,
        error: { code: "UNAUTHENTICATED" },
      });
    });
  });
});
