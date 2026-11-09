import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createExpense = vi.fn();
const updateExpense = vi.fn();
const push = vi.fn();
vi.mock("@/features/expenses/actions", () => ({
  createExpense: (...args: unknown[]) => createExpense(...args),
  updateExpense: (...args: unknown[]) => updateExpense(...args),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }));

import { ExpenseForm } from "@/features/expenses/components/expense-form";
import { CONNECTION_ERROR_MESSAGE } from "@/lib/handle-action-result";

const CATEGORIES = [
  { id: "0b6f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59", name: "Moradia" },
  { id: "1c7f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59", name: "Transporte" },
];

async function fill(name: string, amount: string) {
  await userEvent.clear(screen.getByLabelText("Nome do gasto"));
  await userEvent.type(screen.getByLabelText("Nome do gasto"), name);
  await userEvent.clear(screen.getByLabelText("Valor (R$)"));
  await userEvent.type(screen.getByLabelText("Valor (R$)"), amount);
}

async function chooseCategory(name: string) {
  await userEvent.click(screen.getByRole("combobox", { name: "Categoria" }));
  await userEvent.click(await screen.findByRole("option", { name }));
}

describe("ExpenseForm", () => {
  beforeEach(() => {
    createExpense.mockReset();
    updateExpense.mockReset();
    push.mockReset();
  });

  it("exige a seleção de categoria", async () => {
    render(<ExpenseForm mode="create" categories={CATEGORIES} />);
    await fill("Aluguel", "1500");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar gasto" }));
    expect(await screen.findByText("Selecione uma categoria.")).toBeInTheDocument();
    expect(createExpense).not.toHaveBeenCalled();
  });

  it("cria um gasto com a categoria escolhida", async () => {
    createExpense.mockResolvedValue({ ok: true, data: { id: "1" } });
    render(<ExpenseForm mode="create" categories={CATEGORIES} />);
    await fill("Aluguel", "1.500,00");
    await chooseCategory("Moradia");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar gasto" }));
    expect(createExpense).toHaveBeenCalledWith({
      name: "Aluguel",
      amount: "1.500,00",
      categoryId: CATEGORIES[0].id,
    });
  });

  it("sem categorias cadastradas, avisa e desabilita o envio", () => {
    render(<ExpenseForm mode="create" categories={[]} />);
    expect(screen.getByText("Nenhuma categoria disponível.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Adicionar gasto" })).toBeDisabled();
  });

  it("edita um gasto existente", async () => {
    updateExpense.mockResolvedValue({ ok: true, data: { id: "e1" } });
    render(
      <ExpenseForm
        mode="edit"
        categories={CATEGORIES}
        expense={{
          id: "e1",
          name: "Aluguel",
          amountCents: 150000,
          categoryId: CATEGORIES[0].id,
          categoryName: "Moradia",
        }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Editar Aluguel" }));
    expect(screen.getByLabelText("Valor (R$)")).toHaveValue("1500,00");
    await chooseCategory("Transporte");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(updateExpense).toHaveBeenCalledWith("e1", {
      name: "Aluguel",
      amount: "1500,00",
      categoryId: CATEGORIES[1].id,
    });
  });

  it("mostra aviso de falha quando a action lança exceção", async () => {
    createExpense.mockRejectedValue(new TypeError("Failed to fetch"));
    render(<ExpenseForm mode="create" categories={CATEGORIES} />);
    await fill("Aluguel", "10");
    await chooseCategory("Moradia");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar gasto" }));
    expect(await screen.findByText(CONNECTION_ERROR_MESSAGE)).toBeInTheDocument();
  });

  it("redireciona para /login quando a sessão expirou", async () => {
    createExpense.mockResolvedValue({ ok: false, error: { code: "UNAUTHENTICATED" } });
    render(<ExpenseForm mode="create" categories={CATEGORIES} />);
    await fill("Aluguel", "10");
    await chooseCategory("Moradia");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar gasto" }));
    expect(push).toHaveBeenCalledWith("/login");
  });
});
