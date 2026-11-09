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
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Receita",
      "Momento Presente",
      "Momento Futuro",
    ]);
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
    expect(replaceState).toHaveBeenLastCalledWith(null, "", "/?tab=present");

    await userEvent.click(screen.getByRole("tab", { name: "Receita" }));
    expect(replaceState).toHaveBeenLastCalledWith(null, "", "/");
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
});
