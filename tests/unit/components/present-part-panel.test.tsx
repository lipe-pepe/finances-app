import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createExpense = vi.fn();
vi.mock("@/features/expenses/actions", () => ({
  createExpense: (...args: unknown[]) => createExpense(...args),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

import { AllocationProvider } from "@/features/allocation/components/allocation-provider";
import { PresentPartPanel } from "@/features/expenses/components/present-part-panel";
import type { PartCents } from "@/lib/present-parts";

const CATEGORIES = [{ id: "0b6f9b8e-3f7e-4c9a-9d55-6f1d2c3b4a59", name: "Moradia" }];
const PANELS = {
  essentials: <div data-testid="panel-essentials" />,
  education: <div data-testid="panel-education" />,
  free: <div data-testid="panel-free" />,
};

function renderPanel(planned: Partial<PartCents> = {}) {
  return render(
    <AllocationProvider initialEssentialPercentage={70} initialEducationPercentage={5} initialFreePercentage={5}>
      <PresentPartPanel
        panels={PANELS}
        categories={CATEGORIES}
        revenueCents={1_000_000}
        plannedCentsByPart={{ essentials: 0, education: 0, free: 0, ...planned }}
      />
    </AllocationProvider>,
  );
}

async function choosePart(name: string) {
  await userEvent.click(screen.getByRole("combobox", { name: "Parte" }));
  await userEvent.click(await screen.findByRole("option", { name }));
}

describe("PresentPartPanel (feature 007, US3)", () => {
  beforeEach(() => {
    createExpense.mockReset();
    createExpense.mockResolvedValue({ ok: true, data: { id: "1" } });
  });

  it("começa em Gastos Essenciais e mostra só essa parte (FR-008/009)", () => {
    renderPanel();
    expect(screen.getByRole("combobox", { name: "Parte" })).toHaveTextContent("Gastos Essenciais");
    expect(screen.getByTestId("panel-essentials")).toBeInTheDocument();
    expect(screen.queryByTestId("panel-education")).not.toBeInTheDocument();
    expect(screen.getByTestId("part-budget-essentials")).toHaveTextContent("de R$ 6.000,00");
  });

  it("troca a parte exibida sem recarregar (FR-010)", async () => {
    renderPanel({ education: 40000 });
    await choosePart("Educação");
    expect(screen.getByTestId("panel-education")).toBeInTheDocument();
    expect(screen.queryByTestId("panel-essentials")).not.toBeInTheDocument();
    expect(screen.getByTestId("part-budget-education")).toHaveTextContent("Planejado R$ 400,00 de R$ 500,00");
  });

  it("indica em texto as partes excedidas (FR-013)", async () => {
    renderPanel({ free: 60000 });
    await userEvent.click(screen.getByRole("combobox", { name: "Parte" }));
    expect(await screen.findByRole("option", { name: "Livre — excedida" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Educação" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("option", { name: "Livre — excedida" }));
    expect(screen.getByRole("combobox", { name: "Parte" })).toHaveTextContent("Livre — excedida");
  });

  it("o formulário não tem o campo Parte e cria o gasto na parte selecionada (FR-011)", async () => {
    renderPanel();
    await choosePart("Educação");
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    await userEvent.type(screen.getByLabelText("Nome do gasto"), "Curso");
    await userEvent.type(screen.getByLabelText("Valor (R$)"), "400");
    await userEvent.click(screen.getByRole("combobox", { name: "Categoria" }));
    await userEvent.click(await screen.findByRole("option", { name: "Moradia" }));
    await userEvent.click(screen.getByRole("button", { name: "Adicionar gasto" }));
    expect(createExpense).toHaveBeenCalledWith(expect.objectContaining({ name: "Curso", part: "education" }));
  });

  it("trocar de parte não apaga o que foi digitado (Edge Cases)", async () => {
    renderPanel();
    await userEvent.type(screen.getByLabelText("Nome do gasto"), "Curso");
    await choosePart("Livre");
    expect(screen.getByLabelText("Nome do gasto")).toHaveValue("Curso");
  });

  it("o seletor tem alvo de toque de 44 px (FR-017)", () => {
    renderPanel();
    expect(screen.getByRole("combobox", { name: "Parte" })).toHaveClass("min-h-11");
  });
});
