import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const createActualExpense = vi.fn();
const updateActualExpense = vi.fn();
const narrow = { value: true };
vi.mock("@/features/control/actions", () => ({
  createActualExpense: (...args: unknown[]) => createActualExpense(...args),
  updateActualExpense: (...args: unknown[]) => updateActualExpense(...args),
  deleteActualExpense: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock("@/hooks/use-is-narrow", () => ({
  NARROW_MEDIA_QUERY: "(max-width: 44.99rem)",
  useIsNarrow: () => narrow.value,
}));

import {
  ActualExpenseSheetProvider,
  RegisterExpenseButton,
} from "@/features/control/components/actual-expense-sheet";
import { ActualExpenseList } from "@/features/control/components/actual-expense-list";

const CATEGORIES = [{ id: "0b6f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59", name: "Alimentação" }];
const ITEM = {
  id: "a1",
  name: "Mercado",
  amountCents: 23050,
  categoryId: CATEGORIES[0].id,
  categoryName: "Alimentação",
  spentOn: "2026-11-05",
};

function renderSheet() {
  return render(
    <ActualExpenseSheetProvider categories={CATEGORIES}>
      <ActualExpenseList actualExpenses={[ITEM]} categories={CATEGORIES} showCategory />
      <RegisterExpenseButton />
    </ActualExpenseSheetProvider>,
  );
}

describe("ActualExpenseSheet (celular)", () => {
  beforeAll(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-09T15:00:00Z"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    narrow.value = true;
    createActualExpense.mockReset();
    updateActualExpense.mockReset();
  });

  it("abre o painel de registro pelo botão fixo, com a data de hoje", async () => {
    renderSheet();
    const trigger = screen.getByRole("button", { name: "Registrar gasto" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await userEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Registrar gasto" });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    expect(screen.getByLabelText("Data")).toHaveValue("2026-11-09");
    expect(screen.getByRole("button", { name: "Adicionar gasto" })).toBeInTheDocument();
  });

  it("fecha com Esc e com o botão Fechar, devolvendo o foco ao botão", async () => {
    renderSheet();
    const trigger = screen.getByRole("button", { name: "Registrar gasto" });
    await userEvent.click(trigger);
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();

    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole("button", { name: "Fechar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("fecha após registrar e continua aberto com erro de validação", async () => {
    createActualExpense.mockResolvedValueOnce({
      ok: false,
      error: { code: "VALIDATION", fieldErrors: { name: ["Informe o nome."] } },
    });
    createActualExpense.mockResolvedValueOnce({ ok: true, data: { id: "n1" } });
    renderSheet();
    await userEvent.click(screen.getByRole("button", { name: "Registrar gasto" }));
    await screen.findByRole("dialog");
    await userEvent.type(screen.getByLabelText("Nome do gasto"), "Feira");
    await userEvent.type(screen.getByLabelText("Valor (R$)"), "10");
    await userEvent.click(screen.getByRole("combobox", { name: "Categoria" }));
    await userEvent.click(await screen.findByRole("option", { name: "Alimentação" }));

    await userEvent.click(screen.getByRole("button", { name: "Adicionar gasto" }));
    expect(await screen.findByText("Informe o nome.")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Adicionar gasto" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("abre a edição no painel, já preenchida", async () => {
    updateActualExpense.mockResolvedValue({ ok: true, data: { id: "a1" } });
    renderSheet();
    await userEvent.click(screen.getByRole("button", { name: "Editar Mercado" }));
    await screen.findByRole("dialog", { name: "Editar gasto" });
    expect(screen.getByLabelText("Valor (R$)")).toHaveValue("230,50");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(updateActualExpense).toHaveBeenCalledWith("a1", expect.objectContaining({ name: "Mercado" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("em tela larga, edita na própria linha", async () => {
    narrow.value = false;
    renderSheet();
    await userEvent.click(screen.getByRole("button", { name: "Editar Mercado" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });

  it("fecha o painel quando a tela deixa de ser estreita", async () => {
    const view = renderSheet();
    await userEvent.click(screen.getByRole("button", { name: "Registrar gasto" }));
    await screen.findByRole("dialog");
    narrow.value = false;
    act(() => {
      view.rerender(
        <ActualExpenseSheetProvider categories={CATEGORIES}>
          <ActualExpenseList actualExpenses={[ITEM]} categories={CATEGORIES} showCategory />
          <RegisterExpenseButton />
        </ActualExpenseSheetProvider>,
      );
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    fireEvent.keyDown(document.body, { key: "Escape" });
  });
});
