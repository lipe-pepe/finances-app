import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/control/actions", () => ({
  createActualExpense: vi.fn(),
  updateActualExpense: vi.fn(),
  deleteActualExpense: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

import { ControlDashboard } from "@/features/control/components/control-dashboard";

const HOUSING = "0b6f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59";
const FOOD = "1c7f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59";
const LEISURE = "2d7f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59";
const CATEGORIES = [
  { id: FOOD, name: "Alimentação" },
  { id: LEISURE, name: "Lazer" },
  { id: HOUSING, name: "Moradia" },
];
const PLANNED = { [HOUSING]: 150000, [FOOD]: 80000 };
const EXPENSES = [
  { id: "a1", name: "Mercado", amountCents: 23050, categoryId: FOOD, categoryName: "Alimentação", spentOn: "2026-11-08", part: "essentials" as const },
  { id: "a2", name: "Conta de luz", amountCents: 40000, categoryId: HOUSING, categoryName: "Moradia", spentOn: "2026-11-02", part: "essentials" as const },
];

function summaryValue(label: string) {
  return screen.getByText(label).nextSibling?.textContent;
}

async function selectCategory(name: string) {
  await userEvent.click(screen.getByRole("combobox", { name: "Categoria" }));
  await userEvent.click(await screen.findByRole("option", { name }));
}

function renderDashboard(actualExpenses = EXPENSES) {
  return render(
    <ControlDashboard
      today="2026-11-09"
      categories={CATEGORIES}
      plannedCentsByCategory={PLANNED}
      actualExpenses={actualExpenses}
    />,
  );
}

describe("ControlDashboard", () => {
  it("começa em Todos, somando todas as categorias", () => {
    renderDashboard();
    expect(screen.getByRole("combobox", { name: "Categoria" })).toHaveTextContent("Todos");
    expect(summaryValue("Planejado")).toBe("R$ 2.300,00");
    expect(summaryValue("Gasto")).toBe("R$ 630,50");
    expect(summaryValue("Disponível")).toBe("R$ 1.669,50");
    const list = screen.getByRole("list");
    expect(within(list).getByText("Mercado")).toBeInTheDocument();
    expect(within(list).getByText("Conta de luz")).toBeInTheDocument();
    expect(within(list).getByText("Alimentação")).toBeInTheDocument();
  });

  it("filtra por categoria sem mostrar o nome da categoria na lista", async () => {
    renderDashboard();
    await selectCategory("Moradia");
    expect(summaryValue("Planejado")).toBe("R$ 1.500,00");
    expect(summaryValue("Gasto")).toBe("R$ 400,00");
    expect(summaryValue("Disponível")).toBe("R$ 1.100,00");
    const list = screen.getByRole("list");
    expect(within(list).getByText("Conta de luz")).toBeInTheDocument();
    expect(within(list).queryByText("Mercado")).not.toBeInTheDocument();
    expect(within(list).queryByText("Moradia")).not.toBeInTheDocument();
  });

  it("mostra o estado vazio para categoria sem gastos e sem planejado", async () => {
    renderDashboard();
    await selectCategory("Lazer");
    expect(screen.getByText("Nenhum gasto registrado")).toBeInTheDocument();
    expect(summaryValue("Disponível")).toBe("R$ 0,00");
  });

  it("mantém a categoria selecionada quando os dados são atualizados (FR-020)", async () => {
    const { rerender } = renderDashboard();
    await selectCategory("Moradia");
    rerender(
      <ControlDashboard
        today="2026-11-09"
        categories={CATEGORIES}
        plannedCentsByCategory={PLANNED}
        actualExpenses={[
          ...EXPENSES,
          { id: "a3", name: "Aluguel", amountCents: 120000, categoryId: HOUSING, categoryName: "Moradia", spentOn: "2026-11-09", part: "essentials" as const },
        ]}
      />,
    );
    expect(screen.getByRole("combobox", { name: "Categoria" })).toHaveTextContent("Moradia");
    expect(summaryValue("Gasto")).toBe("R$ 1.600,00");
    expect(summaryValue("Disponível")).toBe("-R$ 100,00");
    expect(screen.getByText("Acima do limite em R$ 100,00")).toBeInTheDocument();
  });
});
