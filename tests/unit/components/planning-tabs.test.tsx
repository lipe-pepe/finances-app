import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/allocation/actions", () => ({
  saveAllocation: vi.fn().mockResolvedValue({ ok: true, data: { essentialPercentage: 50 } }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

import { AllocationProvider } from "@/features/allocation/components/allocation-provider";
import { PlanningTabs } from "@/features/planning/components/planning-tabs";
import type { PlanningTab } from "@/lib/planning-tab";

type TabsProps = ComponentProps<typeof PlanningTabs>;

function tabsProps(overrides: Partial<TabsProps> = {}): TabsProps {
  return {
    initialTab: "income",
    revenueCents: 400000,
    expensesTotalCents: 0,
    goalsTotalCents: 0,
    incomeCount: 2,
    income: <p>conteúdo receita</p>,
    present: <p>conteúdo presente</p>,
    future: <p>conteúdo futuro</p>,
    ...overrides,
  };
}

function renderTabs(overrides: Partial<TabsProps> = {}, essentialPercentage = 50) {
  const view = render(
    <AllocationProvider initialEssentialPercentage={essentialPercentage}>
      <PlanningTabs {...tabsProps(overrides)} />
    </AllocationProvider>,
  );
  const rerenderTabs = (next: Partial<TabsProps>) =>
    view.rerender(
      <AllocationProvider initialEssentialPercentage={essentialPercentage}>
        <PlanningTabs {...tabsProps(next)} />
      </AllocationProvider>,
    );
  return { ...view, rerenderTabs };
}

describe("PlanningTabs", () => {
  let replaceState: ReturnType<typeof vi.spyOn>;
  let pushState: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    replaceState = vi.spyOn(window.history, "replaceState");
    pushState = vi.spyOn(window.history, "pushState");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exibe as três abas na ordem Receita, Momento Presente, Momento Futuro", () => {
    renderTabs();
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAccessibleName("Receita");
    expect(tabs[1]).toHaveAccessibleName("Momento Presente");
    expect(tabs[2]).toHaveAccessibleName("Momento Futuro");
  });

  it("abre na aba Receita mostrando só o conteúdo dela", () => {
    renderTabs();
    expect(screen.getByRole("tab", { name: "Receita" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("conteúdo receita")).toBeInTheDocument();
    expect(screen.queryByText("conteúdo presente")).not.toBeInTheDocument();
    expect(screen.queryByText("conteúdo futuro")).not.toBeInTheDocument();
  });

  it("abre na aba indicada pelo servidor", () => {
    renderTabs({ initialTab: "future" });
    expect(screen.getByRole("tab", { name: "Momento Futuro" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("conteúdo futuro")).toBeInTheDocument();
    expect(screen.queryByText("conteúdo receita")).not.toBeInTheDocument();
  });

  it("troca de aba e atualiza o endereço sem criar entrada no histórico", async () => {
    renderTabs();
    await userEvent.click(screen.getByRole("tab", { name: "Momento Presente" }));
    expect(screen.getByText("conteúdo presente")).toBeInTheDocument();
    expect(replaceState).toHaveBeenLastCalledWith(null, "", "/planning?tab=present");

    await userEvent.click(screen.getByRole("tab", { name: "Receita" }));
    expect(replaceState).toHaveBeenLastCalledWith(null, "", "/planning");
    expect(pushState).not.toHaveBeenCalled();
  });

  it("permite trocar de aba pelo teclado", async () => {
    renderTabs();
    screen.getByRole("tab", { name: "Receita" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Momento Presente" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("sinaliza no nome da aba a seção que excede o planejado, de qualquer aba", () => {
    // 50% de R$ 4.000,00 = R$ 2.000,00 planejado para cada momento
    renderTabs({ expensesTotalCents: 210000, goalsTotalCents: 100000 });
    expect(screen.getByRole("tab", { name: "Receita" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Momento Presente, com alerta" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Momento Futuro" })).toBeInTheDocument();
  });

  it("não sinaliza a aba quando a soma é igual ao planejado", () => {
    renderTabs({ expensesTotalCents: 200000, goalsTotalCents: 200000 });
    expect(screen.getByRole("tab", { name: "Momento Presente" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Momento Futuro" })).toBeInTheDocument();
  });

  it("mantém a aba escolhida quando o servidor renderiza a página de novo", async () => {
    const { rerenderTabs } = renderTabs();
    await userEvent.click(screen.getByRole("tab", { name: "Momento Futuro" }));
    // Simula a re-renderização após uma Server Action (revalidatePath) com valor inicial antigo
    rerenderTabs({ initialTab: "income" as PlanningTab, future: <p>futuro atualizado</p> });
    expect(screen.getByRole("tab", { name: "Momento Futuro" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("futuro atualizado")).toBeInTheDocument();
  });

  it("marca a parte ativa para a cor da aba", async () => {
    const { container } = renderTabs();
    const root = container.querySelector("[data-section]");
    expect(root).toHaveAttribute("data-section", "income");
    await userEvent.click(screen.getByRole("tab", { name: "Momento Presente" }));
    expect(root).toHaveAttribute("data-section", "present");
  });

  it("mostra o resumo de cada parte nos cards", () => {
    renderTabs({ revenueCents: 625050, expensesTotalCents: 275000 });
    expect(screen.getByRole("tab", { name: "Receita" })).toHaveAccessibleDescription(
      "R$ 6.250,50 2 ganhos cadastrados",
    );
    expect(screen.getByRole("tab", { name: "Momento Presente" })).toHaveAccessibleDescription(
      "R$ 3.125,25 50% da receita · gastos R$ 2.750,00 (88%)",
    );
    expect(screen.getByRole("tab", { name: "Momento Futuro" })).toHaveAccessibleDescription(
      "R$ 3.125,25 50% da receita · metas R$ 0,00 (0%)",
    );
  });
});
