import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/expenses/actions", () => ({
  createExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
}));
vi.mock("@/features/goals/actions", () => ({
  createGoal: vi.fn(),
  updateGoal: vi.fn(),
  deleteGoal: vi.fn(),
}));
vi.mock("@/features/incomes/actions", () => ({
  createIncome: vi.fn(),
  updateIncome: vi.fn(),
  deleteIncome: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

import { ExpenseList } from "@/features/expenses/components/expense-list";
import { GoalList } from "@/features/goals/components/goal-list";
import { IncomeList } from "@/features/incomes/components/income-list";

const HOUSING = { id: "0b6f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59", name: "Moradia" };

describe("listas do planejamento", () => {
  it("mostra o ícone da categoria em cada gasto", () => {
    const { container } = render(
      <ExpenseList
        categories={[HOUSING]}
        expenses={[
          { id: "e1", name: "Aluguel", amountCents: 120000, categoryId: HOUSING.id, categoryName: "Moradia" },
        ]}
      />,
    );
    expect(container.querySelector(".bg-category-housing-soft")).not.toBeNull();
  });

  it("usa o ícone de meta sem categoria", () => {
    const { container } = render(
      <GoalList
        categories={[HOUSING]}
        goals={[{ id: "g1", name: "Presente", amountCents: 15000, categoryId: null, categoryName: null }]}
      />,
    );
    expect(container.querySelector(".bg-category-none-soft")).not.toBeNull();
  });

  it("mostra a carteira da marca em cada ganho", () => {
    const { container } = render(
      <IncomeList incomes={[{ id: "i1", name: "Salário", amountCents: 500000 }]} />,
    );
    expect(container.querySelector(".bg-brand-soft")).not.toBeNull();
  });
});
