import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const createActualExpense = vi.fn();
const updateActualExpense = vi.fn();
const push = vi.fn();
vi.mock("@/features/control/actions", () => ({
  createActualExpense: (...args: unknown[]) => createActualExpense(...args),
  updateActualExpense: (...args: unknown[]) => updateActualExpense(...args),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }));

import { ActualExpenseForm } from "@/features/control/components/actual-expense-form";

const CATEGORIES = [
  { id: "0b6f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59", name: "Alimentação" },
  { id: "1c7f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59", name: "Moradia" },
];

async function chooseCategory(name: string) {
  await userEvent.click(screen.getByRole("combobox", { name: "Categoria" }));
  await userEvent.click(await screen.findByRole("option", { name }));
}

describe("ActualExpenseForm", () => {
  beforeAll(() => {
    // "Hoje" fixo: 09/11/2026 em Brasília; só o Date é simulado
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-09T15:00:00Z"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    createActualExpense.mockReset();
    updateActualExpense.mockReset();
    push.mockReset();
  });

  it("começa com a data de hoje e limita a data ao mês atual", () => {
    render(<ActualExpenseForm mode="create" categories={CATEGORIES} />);
    const date = screen.getByLabelText("Data");
    expect(date).toHaveAttribute("type", "date");
    expect(date).toHaveValue("2026-11-09");
    expect(date).toHaveAttribute("min", "2026-11-01");
    expect(date).toHaveAttribute("max", "2026-11-30");
  });

  it("explica que só dias do mês atual são aceitos", () => {
    render(<ActualExpenseForm mode="create" categories={CATEGORIES} />);
    expect(screen.getByLabelText("Data")).toHaveAccessibleDescription(
      "Somente dias de novembro de 2026.",
    );
  });

  it("mostra os erros por campo sem chamar a action", async () => {
    render(<ActualExpenseForm mode="create" categories={CATEGORIES} />);
    await userEvent.click(screen.getByRole("button", { name: "Adicionar gasto" }));
    expect(await screen.findByText("Informe o nome.")).toBeInTheDocument();
    expect(screen.getByText("Informe o valor.")).toBeInTheDocument();
    expect(screen.getByText("Selecione uma categoria.")).toBeInTheDocument();
    expect(createActualExpense).not.toHaveBeenCalled();
  });

  it("recusa data fora do mês atual", async () => {
    render(<ActualExpenseForm mode="create" categories={CATEGORIES} />);
    await userEvent.type(screen.getByLabelText("Nome do gasto"), "Mercado");
    await userEvent.type(screen.getByLabelText("Valor (R$)"), "10");
    await chooseCategory("Alimentação");
    fireEvent.change(screen.getByLabelText("Data"), { target: { value: "2026-10-31" } });
    await userEvent.click(screen.getByRole("button", { name: "Adicionar gasto" }));
    expect(await screen.findByText("A data deve estar dentro do mês atual.")).toBeInTheDocument();
    expect(createActualExpense).not.toHaveBeenCalled();
  });

  it("registra o gasto e volta ao estado inicial com a data de hoje", async () => {
    createActualExpense.mockResolvedValue({ ok: true, data: { id: "a1" } });
    render(<ActualExpenseForm mode="create" categories={CATEGORIES} />);
    await userEvent.type(screen.getByLabelText("Nome do gasto"), "Mercado");
    await userEvent.type(screen.getByLabelText("Valor (R$)"), "230,50");
    await chooseCategory("Alimentação");
    fireEvent.change(screen.getByLabelText("Data"), { target: { value: "2026-11-05" } });
    await userEvent.click(screen.getByRole("button", { name: "Adicionar gasto" }));

    expect(createActualExpense).toHaveBeenCalledWith({
      name: "Mercado",
      amount: "230,50",
      categoryId: CATEGORIES[0].id,
      spentOn: "2026-11-05",
      part: "essentials",
    });
    await waitFor(() => expect(screen.getByLabelText("Nome do gasto")).toHaveValue(""));
    expect(screen.getByLabelText("Data")).toHaveValue("2026-11-09");
  });

  it("mostra no campo de data o erro devolvido pelo servidor", async () => {
    createActualExpense.mockResolvedValue({
      ok: false,
      error: {
        code: "VALIDATION",
        fieldErrors: { spentOn: ["A data deve estar dentro do mês atual."] },
      },
    });
    render(<ActualExpenseForm mode="create" categories={CATEGORIES} />);
    await userEvent.type(screen.getByLabelText("Nome do gasto"), "Mercado");
    await userEvent.type(screen.getByLabelText("Valor (R$)"), "10");
    await chooseCategory("Alimentação");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar gasto" }));
    expect(await screen.findByText("A data deve estar dentro do mês atual.")).toBeInTheDocument();
  });

  it("edita um gasto existente", async () => {
    updateActualExpense.mockResolvedValue({ ok: true, data: { id: "a1" } });
    render(
      <ActualExpenseForm
        mode="edit"
        categories={CATEGORIES}
        actualExpense={{
          id: "a1",
          name: "Mercado",
          amountCents: 23050,
          categoryId: CATEGORIES[0].id,
          categoryName: "Alimentação",
          spentOn: "2026-11-05",
          part: "essentials",
        }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Editar Mercado" }));
    expect(screen.getByLabelText("Valor (R$)")).toHaveValue("230,50");
    expect(screen.getByLabelText("Data")).toHaveValue("2026-11-05");
    await chooseCategory("Moradia");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(updateActualExpense).toHaveBeenCalledWith("a1", {
      name: "Mercado",
      amount: "230,50",
      categoryId: CATEGORIES[1].id,
      spentOn: "2026-11-05",
      part: "essentials",
    });
  });

  it("avisa quem usa o formulário depois de salvar com sucesso", async () => {
    createActualExpense.mockResolvedValue({ ok: true, data: { id: "a1" } });
    const onSuccess = vi.fn();
    render(<ActualExpenseForm mode="create" categories={CATEGORIES} onSuccess={onSuccess} />);
    await userEvent.type(screen.getByLabelText("Nome do gasto"), "Mercado");
    await userEvent.type(screen.getByLabelText("Valor (R$)"), "10");
    await chooseCategory("Alimentação");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar gasto" }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  it("mostra a edição direto, sem o botão de lápis, quando controlada de fora", () => {
    render(
      <ActualExpenseForm
        mode="edit"
        showTrigger={false}
        categories={CATEGORIES}
        actualExpense={{
          id: "a1",
          name: "Mercado",
          amountCents: 23050,
          categoryId: CATEGORIES[0].id,
          categoryName: "Alimentação",
          spentOn: "2026-11-05",
          part: "essentials",
        }}
      />,
    );
    expect(screen.queryByRole("button", { name: "Editar Mercado" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Nome do gasto")).toHaveValue("Mercado");
  });

  it("tem o campo Parte com Gastos Essenciais marcado e envia a parte escolhida (FR-015)", async () => {
    createActualExpense.mockResolvedValue({ ok: true, data: { id: "a2" } });
    render(<ActualExpenseForm mode="create" categories={CATEGORIES} />);
    expect(screen.getByRole("radio", { name: "Gastos Essenciais" })).toBeChecked();
    await userEvent.type(screen.getByLabelText("Nome do gasto"), "Livro");
    await userEvent.type(screen.getByLabelText("Valor (R$)"), "80");
    await chooseCategory("Alimentação");
    fireEvent.change(screen.getByLabelText("Data"), { target: { value: "2026-11-05" } });
    await userEvent.click(screen.getByRole("radio", { name: "Educação" }));
    await userEvent.click(screen.getByRole("button", { name: "Adicionar gasto" }));
    expect(createActualExpense).toHaveBeenCalledWith(expect.objectContaining({ part: "education" }));
    await waitFor(() => expect(screen.getByRole("radio", { name: "Gastos Essenciais" })).toBeChecked());
  });
});
