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
import type { ActualExpenseItem } from "@/features/control/queries";

const HOUSING = "0b6f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59";
const FOOD = "1c7f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59";
const LEISURE = "2d7f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59";
const CATEGORIES = [
  { id: FOOD, name: "Alimentação" },
  { id: LEISURE, name: "Lazer" },
  { id: HOUSING, name: "Moradia" },
];
// Receita de R$ 10.000,00 e partes 60/5/5 (Momento Presente 70%)
const PERCENTAGES = { essentials: 60, education: 5, free: 5 };
const PRESENT_LIMIT = 700000;
const PART_LIMITS = { essentials: 600000, education: 50000, free: 50000 };

const EXPENSES: ActualExpenseItem[] = [
  { id: "a1", name: "Mercado", amountCents: 120000, categoryId: FOOD, categoryName: "Alimentação", spentOn: "2026-11-08", part: "essentials" },
  { id: "a2", name: "Livro", amountCents: 10000, categoryId: HOUSING, categoryName: "Moradia", spentOn: "2026-11-02", part: "education" },
  { id: "a3", name: "Cinema", amountCents: 5000, categoryId: FOOD, categoryName: "Alimentação", spentOn: "2026-11-03", part: "free" },
];

function summaryValue(label: string) {
  return screen.getByText(label, { selector: "dt" }).nextSibling?.textContent;
}

async function selectCategory(name: string) {
  await userEvent.click(screen.getByRole("combobox", { name: "Categoria" }));
  await userEvent.click(await screen.findByRole("option", { name }));
}

function partButton(name: string) {
  return screen.getByRole("button", { name: new RegExp(`^${name},`) });
}

function renderDashboard(actualExpenses = EXPENSES) {
  return render(
    <ControlDashboard
      today="2026-11-09"
      categories={CATEGORIES}
      actualExpenses={actualExpenses}
      partPercentages={PERCENTAGES}
      presentLimitCents={PRESENT_LIMIT}
      partLimitCents={PART_LIMITS}
    />,
  );
}

describe("ControlDashboard", () => {
  it("sem parte ativa, mostra todo o Momento Presente (FR-028/029)", () => {
    renderDashboard();
    expect(screen.getByRole("combobox", { name: "Categoria" })).toHaveTextContent("Todos");
    expect(summaryValue("Limite")).toBe("R$ 7.000,00");
    expect(summaryValue("Gasto")).toBe("R$ 1.350,00");
    expect(summaryValue("Disponível")).toBe("R$ 5.650,00");
    expect(screen.getAllByTestId(/^chart-legend-/)).toHaveLength(3);
    const list = screen.getByRole("region", { name: "Gastos do mês" });
    expect(within(list).getByText("Mercado")).toBeInTheDocument();
    expect(within(list).getByText("Livro")).toBeInTheDocument();
  });

  it("ativar uma parte filtra resumo, gráfico e lista; clicar de novo desativa (US5-3/4)", async () => {
    renderDashboard();
    await userEvent.click(partButton("Educação"));
    expect(partButton("Educação")).toHaveAttribute("aria-pressed", "true");
    expect(summaryValue("Limite")).toBe("R$ 500,00");
    expect(summaryValue("Gasto")).toBe("R$ 100,00");
    expect(summaryValue("Disponível")).toBe("R$ 400,00");
    expect(screen.getAllByTestId(/^chart-legend-/)).toHaveLength(1);
    expect(screen.getByTestId("chart-legend-education")).toBeInTheDocument();
    expect(screen.getByText("Livro")).toBeInTheDocument();
    expect(screen.queryByText("Mercado")).not.toBeInTheDocument();

    await userEvent.click(partButton("Educação"));
    expect(partButton("Educação")).toHaveAttribute("aria-pressed", "false");
    expect(summaryValue("Limite")).toBe("R$ 7.000,00");
    expect(screen.getByText("Mercado")).toBeInTheDocument();
  });

  it("clicar em outra parte troca a parte ativa", async () => {
    renderDashboard();
    await userEvent.click(partButton("Educação"));
    await userEvent.click(partButton("Livre"));
    expect(partButton("Livre")).toHaveAttribute("aria-pressed", "true");
    expect(partButton("Educação")).toHaveAttribute("aria-pressed", "false");
    expect(summaryValue("Limite")).toBe("R$ 500,00");
    expect(summaryValue("Gasto")).toBe("R$ 50,00");
  });

  it("a categoria filtra os gastos, mas não o limite (US4-5, US5-6)", async () => {
    renderDashboard();
    await selectCategory("Alimentação");
    expect(summaryValue("Limite")).toBe("R$ 7.000,00");
    expect(summaryValue("Gasto")).toBe("R$ 1.250,00");
    await userEvent.click(partButton("Livre"));
    expect(summaryValue("Limite")).toBe("R$ 500,00");
    expect(summaryValue("Gasto")).toBe("R$ 50,00");
    expect(screen.queryByText("Livro")).not.toBeInTheDocument();
  });

  it("mostra o estado vazio para categoria sem gastos", async () => {
    renderDashboard();
    await selectCategory("Lazer");
    expect(screen.getByText("Nenhum gasto registrado")).toBeInTheDocument();
    expect(summaryValue("Disponível")).toBe("R$ 7.000,00");
  });

  it("mantém a categoria selecionada quando os dados são atualizados (FR-020)", async () => {
    const { rerender } = renderDashboard();
    await selectCategory("Moradia");
    rerender(
      <ControlDashboard
        today="2026-11-09"
        categories={CATEGORIES}
        actualExpenses={[
          ...EXPENSES,
          { id: "a4", name: "Aluguel", amountCents: 700000, categoryId: HOUSING, categoryName: "Moradia", spentOn: "2026-11-09", part: "essentials" },
        ]}
        partPercentages={PERCENTAGES}
        presentLimitCents={PRESENT_LIMIT}
        partLimitCents={PART_LIMITS}
      />,
    );
    expect(screen.getByRole("combobox", { name: "Categoria" })).toHaveTextContent("Moradia");
    expect(summaryValue("Gasto")).toBe("R$ 7.100,00");
    expect(summaryValue("Disponível")).toBe("-R$ 100,00");
    expect(screen.getByText("Acima do limite em R$ 100,00")).toBeInTheDocument();
  });
});
