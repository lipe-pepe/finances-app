import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createIncome = vi.fn();
const updateIncome = vi.fn();
const push = vi.fn();
vi.mock("@/features/incomes/actions", () => ({
  createIncome: (...args: unknown[]) => createIncome(...args),
  updateIncome: (...args: unknown[]) => updateIncome(...args),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }));

import { IncomeForm } from "@/features/incomes/components/income-form";
import { CONNECTION_ERROR_MESSAGE } from "@/lib/handle-action-result";

async function fillAndSubmit(name: string, amount: string) {
  const nameInput = screen.getByLabelText("Nome do ganho");
  const amountInput = screen.getByLabelText("Valor (R$)");
  await userEvent.clear(nameInput);
  if (name) await userEvent.type(nameInput, name);
  await userEvent.clear(amountInput);
  if (amount) await userEvent.type(amountInput, amount);
  await userEvent.click(screen.getByRole("button", { name: /salvar|adicionar/i }));
}

describe("IncomeForm", () => {
  beforeEach(() => {
    createIncome.mockReset();
    updateIncome.mockReset();
    push.mockReset();
  });

  it("valida os campos no cliente antes de chamar a action", async () => {
    render(<IncomeForm mode="create" />);
    await fillAndSubmit("", "0");
    expect(await screen.findByText("Informe o nome.")).toBeInTheDocument();
    expect(screen.getByText("O valor deve ser maior que zero.")).toBeInTheDocument();
    expect(createIncome).not.toHaveBeenCalled();
  });

  it("cria um ganho enviando o valor digitado e limpa o formulário", async () => {
    createIncome.mockResolvedValue({ ok: true, data: { id: "1" } });
    render(<IncomeForm mode="create" />);
    await fillAndSubmit("Salário", "5.000,00");
    expect(createIncome).toHaveBeenCalledWith({ name: "Salário", amount: "5.000,00" });
    expect(screen.getByLabelText("Nome do ganho")).toHaveValue("");
  });

  it("aplica nos campos os erros de validação vindos do servidor", async () => {
    createIncome.mockResolvedValue({
      ok: false,
      error: { code: "VALIDATION", fieldErrors: { name: ["Nome rejeitado pelo servidor."] } },
    });
    render(<IncomeForm mode="create" />);
    await fillAndSubmit("Salário", "10");
    expect(await screen.findByText("Nome rejeitado pelo servidor.")).toBeInTheDocument();
  });

  it("edita um ganho com os valores iniciais preenchidos", async () => {
    updateIncome.mockResolvedValue({ ok: true, data: { id: "abc" } });
    render(<IncomeForm mode="edit" income={{ id: "abc", name: "Salário", amountCents: 500000 }} />);
    await userEvent.click(screen.getByRole("button", { name: "Editar Salário" }));
    expect(screen.getByLabelText("Nome do ganho")).toHaveValue("Salário");
    expect(screen.getByLabelText("Valor (R$)")).toHaveValue("5000,00");
    await fillAndSubmit("Salário novo", "5500");
    expect(updateIncome).toHaveBeenCalledWith("abc", { name: "Salário novo", amount: "5500" });
  });

  it("mostra aviso de falha quando a action lança exceção", async () => {
    createIncome.mockRejectedValue(new TypeError("Failed to fetch"));
    render(<IncomeForm mode="create" />);
    await fillAndSubmit("Salário", "10");
    expect(await screen.findByText(CONNECTION_ERROR_MESSAGE)).toBeInTheDocument();
  });

  it("redireciona para /login quando a sessão expirou", async () => {
    createIncome.mockResolvedValue({ ok: false, error: { code: "UNAUTHENTICATED" } });
    render(<IncomeForm mode="create" />);
    await fillAndSubmit("Salário", "10");
    expect(push).toHaveBeenCalledWith("/login");
  });

  it("usa no botão de envio a cor da parte ativa do Planejamento", () => {
    render(<IncomeForm mode="create" />);
    expect(screen.getByRole("button", { name: "Adicionar ganho" })).toHaveClass("bg-section");
  });
});
