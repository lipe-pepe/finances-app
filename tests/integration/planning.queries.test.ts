import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTestUsers, getAnyCategory, prisma, resetDatabase, type TestUsers } from "../setup/db";
import { getPlanningData } from "@/features/planning/queries";

describe("getPlanningData", () => {
  let users: TestUsers;

  beforeAll(async () => {
    users = await createTestUsers();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it("usa 50% quando o usuário nunca ajustou a divisão e retorna listas vazias", async () => {
    const data = await getPlanningData(users.userA);
    expect(data.essentialPercentage).toBe(50);
    expect(data.educationPercentage).toBe(0);
    expect(data.freePercentage).toBe(0);
    expect(data.incomes).toEqual([]);
    expect(data.revenueCents).toBe(0);
    expect(data.expensesTotalCents).toBe(0);
    expect(data.goalsTotalCents).toBe(0);
  });

  it("retorna somente os dados do usuário informado, com somas exatas ao centavo", async () => {
    const category = await getAnyCategory();
    await prisma.income.createMany({
      data: [
        { userId: users.userA, name: "Salário", amount: "5000.00" },
        { userId: users.userA, name: "Freelance", amount: "1250.50" },
        { userId: users.userB, name: "Salário de B", amount: "9999.99" },
      ],
    });
    await prisma.expense.createMany({
      data: [
        { userId: users.userA, name: "Aluguel", amount: "1500.00", categoryId: category.id },
        { userId: users.userA, name: "Mercado", amount: "450.75", categoryId: category.id },
        { userId: users.userB, name: "Gasto de B", amount: "10.00", categoryId: category.id },
      ],
    });
    await prisma.goal.createMany({
      data: [
        { userId: users.userA, name: "Viagem", amount: "500.00" },
        { userId: users.userA, name: "Curso", amount: "300.00", categoryId: category.id },
        { userId: users.userB, name: "Meta de B", amount: "1.00" },
      ],
    });
    await prisma.allocation.create({
      data: { userId: users.userA, essentialPercentage: 70, educationPercentage: 5, freePercentage: 3 },
    });
    await prisma.allocation.create({ data: { userId: users.userB, essentialPercentage: 20 } });

    const data = await getPlanningData(users.userA);

    expect(data.essentialPercentage).toBe(70);
    expect(data.educationPercentage).toBe(5);
    expect(data.freePercentage).toBe(3);
    expect(data.incomes.map((income) => income.name)).toEqual(["Salário", "Freelance"]);
    expect(data.revenueCents).toBe(625050);
    expect(data.expenses.map((expense) => expense.name)).toEqual(["Aluguel", "Mercado"]);
    expect(data.expenses[0].categoryName).toBe(category.name);
    expect(data.expensesTotalCents).toBe(195075);
    expect(data.goals.map((goal) => goal.name)).toEqual(["Viagem", "Curso"]);
    expect(data.goals[0].categoryId).toBeNull();
    expect(data.goalsTotalCents).toBe(80000);
  });

  it("retorna as categorias ordenadas por nome", async () => {
    const data = await getPlanningData(users.userA);
    const names = data.categories.map((category) => category.name);
    expect(names.length).toBeGreaterThan(0);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "pt-BR")));
  });
});
