import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createGoal = vi.fn();
const updateGoal = vi.fn();
const push = vi.fn();
vi.mock("@/features/goals/actions", () => ({
  createGoal: (...args: unknown[]) => createGoal(...args),
  updateGoal: (...args: unknown[]) => updateGoal(...args),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }));

import { GoalForm } from "@/features/goals/components/goal-form";
import { NO_CATEGORY } from "@/features/goals/schemas";
import { CONNECTION_ERROR_MESSAGE } from "@/lib/handle-action-result";

const CATEGORIES = [{ id: "0b6f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59", name: "Viagem" }];

async function fill(name: string, amount: string) {
  await userEvent.clear(screen.getByLabelText("Nome da meta"));
  await userEvent.type(screen.getByLabelText("Nome da meta"), name);
  await userEvent.clear(screen.getByLabelText("Valor (R$)"));
  await userEvent.type(screen.getByLabelText("Valor (R$)"), amount);
}

describe("GoalForm", () => {
  beforeEach(() => {
    createGoal.mockReset();
    updateGoal.mockReset();
    push.mockReset();
  });

  it("salva uma meta sem categoria", async () => {
    createGoal.mockResolvedValue({ ok: true, data: { id: "1" } });
    render(<GoalForm mode="create" categories={CATEGORIES} />);
    expect(screen.getByRole("combobox", { name: "Categoria (opcional)" })).toHaveTextContent(
      "Sem categoria",
    );
    await fill("Viagem", "500");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar meta" }));
    expect(createGoal).toHaveBeenCalledWith({ name: "Viagem", amount: "500", categoryId: NO_CATEGORY });
  });

  it("exige nome e valor", async () => {
    render(<GoalForm mode="create" categories={CATEGORIES} />);
    await userEvent.click(screen.getByRole("button", { name: "Adicionar meta" }));
    expect(await screen.findByText("Informe o nome.")).toBeInTheDocument();
    expect(screen.getByText("Informe o valor.")).toBeInTheDocument();
    expect(createGoal).not.toHaveBeenCalled();
  });

  it("edita uma meta com categoria", async () => {
    updateGoal.mockResolvedValue({ ok: true, data: { id: "g1" } });
    render(
      <GoalForm
        mode="edit"
        categories={CATEGORIES}
        goal={{
          id: "g1",
          name: "Viagem",
          amountCents: 50000,
          categoryId: CATEGORIES[0].id,
          categoryName: "Viagem",
        }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Editar Viagem" }));
    await userEvent.click(screen.getByRole("combobox", { name: "Categoria (opcional)" }));
    await userEvent.click(await screen.findByRole("option", { name: "Sem categoria" }));
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(updateGoal).toHaveBeenCalledWith("g1", {
      name: "Viagem",
      amount: "500,00",
      categoryId: NO_CATEGORY,
    });
  });

  it("mostra aviso de falha quando a action lança exceção", async () => {
    createGoal.mockRejectedValue(new TypeError("Failed to fetch"));
    render(<GoalForm mode="create" categories={CATEGORIES} />);
    await fill("Viagem", "500");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar meta" }));
    expect(await screen.findByText(CONNECTION_ERROR_MESSAGE)).toBeInTheDocument();
  });

  it("redireciona para /login quando a sessão expirou", async () => {
    createGoal.mockResolvedValue({ ok: false, error: { code: "UNAUTHENTICATED" } });
    render(<GoalForm mode="create" categories={CATEGORIES} />);
    await fill("Viagem", "500");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar meta" }));
    expect(push).toHaveBeenCalledWith("/login");
  });
});
