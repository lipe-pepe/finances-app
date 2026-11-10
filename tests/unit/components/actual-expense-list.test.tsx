import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/control/actions", () => ({
  createActualExpense: vi.fn(),
  updateActualExpense: vi.fn(),
  deleteActualExpense: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

import { ActualExpenseList } from "@/features/control/components/actual-expense-list";

const CATEGORIES = [{ id: "0b6f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59", name: "Alimentação" }];
const ITEMS = [
  {
    id: "a1",
    name: "Mercado",
    amountCents: 23050,
    categoryId: CATEGORIES[0].id,
    categoryName: "Alimentação",
    spentOn: "2026-11-05",
  },
];

describe("ActualExpenseList", () => {
  it("mostra o estado vazio", () => {
    render(<ActualExpenseList actualExpenses={[]} categories={CATEGORIES} showCategory />);
    expect(screen.getByText("Nenhum gasto registrado")).toBeInTheDocument();
  });

  it("mostra nome, valor, data e as ações de cada gasto", () => {
    render(<ActualExpenseList actualExpenses={ITEMS} categories={CATEGORIES} showCategory />);
    expect(screen.getByText("Mercado")).toBeInTheDocument();
    expect(screen.getByText("R$ 230,50")).toBeInTheDocument();
    expect(screen.getByText("05/11/2026")).toBeInTheDocument();
    expect(screen.getByText("Alimentação")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar Mercado" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apagar Mercado" })).toBeInTheDocument();
  });

  it("omite a categoria quando uma categoria já está selecionada", () => {
    render(
      <ActualExpenseList actualExpenses={ITEMS} categories={CATEGORIES} showCategory={false} />,
    );
    expect(screen.queryByText("Alimentação")).not.toBeInTheDocument();
  });

  it("mostra o ícone da categoria em cada gasto, com ou sem o nome da categoria", () => {
    const { container, rerender } = render(
      <ActualExpenseList actualExpenses={ITEMS} categories={CATEGORIES} showCategory />,
    );
    expect(container.querySelector(".bg-category-food-soft")).not.toBeNull();
    rerender(
      <ActualExpenseList actualExpenses={ITEMS} categories={CATEGORIES} showCategory={false} />,
    );
    expect(container.querySelector(".bg-category-food-soft")).not.toBeNull();
  });
});
