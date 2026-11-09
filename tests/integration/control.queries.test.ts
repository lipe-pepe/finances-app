import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  createActualExpenseRow,
  createTestUsers,
  getAnyCategory,
  prisma,
  resetDatabase,
  type TestUsers,
} from "../setup/db";
import { getControlData } from "@/features/control/queries";

describe("getControlData", () => {
  let users: TestUsers;
  let housing: { id: string; name: string };
  let food: { id: string; name: string };

  beforeAll(async () => {
    users = await createTestUsers();
    housing = await getAnyCategory("Moradia");
    food = await getAnyCategory("Alimentação");
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it("retorna só os gastos realizados do usuário no mês, mais recentes primeiro", async () => {
    const add = (userId: string, name: string, spentOn: string, categoryId = housing.id) =>
      createActualExpenseRow(userId, { name, amountCents: 1000, categoryId, spentOn });
    await add(users.userA, "Outubro", "2026-10-31");
    await add(users.userA, "Dezembro", "2026-12-01");
    await add(users.userB, "De B", "2026-11-05");
    await add(users.userA, "Dia 2", "2026-11-02", food.id);
    await add(users.userA, "Dia 9 (primeiro)", "2026-11-09");
    await add(users.userA, "Dia 9 (segundo)", "2026-11-09");

    const data = await getControlData(users.userA, "2026-11-09");
    expect(data.today).toBe("2026-11-09");
    expect(data.actualExpenses.map((item) => item.name)).toEqual([
      "Dia 9 (segundo)",
      "Dia 9 (primeiro)",
      "Dia 2",
    ]);
    expect(data.actualExpenses[2]).toMatchObject({
      amountCents: 1000,
      categoryId: food.id,
      categoryName: "Alimentação",
      spentOn: "2026-11-02",
    });
  });

  it("soma os gastos planejados por categoria e ignora as metas", async () => {
    await prisma.expense.createMany({
      data: [
        { userId: users.userA, name: "Aluguel", amount: "1000.00", categoryId: housing.id },
        { userId: users.userA, name: "Condomínio", amount: "500.00", categoryId: housing.id },
        { userId: users.userA, name: "Mercado", amount: "800.00", categoryId: food.id },
        { userId: users.userB, name: "De B", amount: "99.00", categoryId: housing.id },
      ],
    });
    await prisma.goal.create({
      data: { userId: users.userA, name: "Reforma", amount: "300.00", categoryId: housing.id },
    });

    const data = await getControlData(users.userA, "2026-11-09");
    expect(data.plannedCentsByCategory).toEqual({ [housing.id]: 150000, [food.id]: 80000 });
  });

  it("lista as categorias em ordem alfabética", async () => {
    const data = await getControlData(users.userA, "2026-11-09");
    const names = data.categories.map((category) => category.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "pt-BR")));
    expect(names).toContain("Moradia");
  });
});
