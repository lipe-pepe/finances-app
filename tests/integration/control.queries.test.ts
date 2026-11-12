import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  createActualExpenseRow,
  createTestUsers,
  getAnyCategory,
  prisma,
  resetDatabase,
  setAllocation,
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
      part: "essentials" as const,
    });
  });

  it("calcula o limite do Momento Presente e de cada parte (feature 006, FR-018/029)", async () => {
    await prisma.income.createMany({
      data: [
        { userId: users.userA, name: "Salário", amount: "10000.00" },
        { userId: users.userB, name: "De B", amount: "99999.00" },
      ],
    });
    await setAllocation(users.userA, { essentialPercentage: 70, educationPercentage: 5, freePercentage: 5 });

    const data = await getControlData(users.userA, "2026-11-09");
    expect(data.presentPercentage).toBe(70);
    expect(data.partPercentages).toEqual({ essentials: 60, education: 5, free: 5 });
    expect(data.presentLimitCents).toBe(700000);
    expect(data.partLimitCents).toEqual({ essentials: 600000, education: 50000, free: 50000 });
    expect(data).not.toHaveProperty("plannedCentsByCategory");
  });

  it("sem divisão gravada, usa 50% com tudo em Gastos Essenciais", async () => {
    await prisma.income.create({ data: { userId: users.userA, name: "Salário", amount: "1000.00" } });
    const data = await getControlData(users.userA, "2026-11-09");
    expect(data.partPercentages).toEqual({ essentials: 50, education: 0, free: 0 });
    expect(data.partLimitCents).toEqual({ essentials: 50000, education: 0, free: 0 });
  });

  it("devolve a parte de cada gasto realizado", async () => {
    await createActualExpenseRow(users.userA, {
      name: "Livro",
      amountCents: 8000,
      categoryId: housing.id,
      spentOn: "2026-11-05",
      part: "education",
    });
    const data = await getControlData(users.userA, "2026-11-09");
    expect(data.actualExpenses[0]).toMatchObject({ name: "Livro", part: "education" });
  });

  it("lista as categorias em ordem alfabética", async () => {
    const data = await getControlData(users.userA, "2026-11-09");
    const names = data.categories.map((category) => category.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "pt-BR")));
    expect(names).toContain("Moradia");
  });
});
