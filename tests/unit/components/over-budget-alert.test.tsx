import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/allocation/actions", () => ({
  saveAllocation: vi.fn().mockResolvedValue({ ok: true, data: { essentialPercentage: 0 } }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

import { AllocationProvider } from "@/features/allocation/components/allocation-provider";
import { AllocationSlider } from "@/features/allocation/components/allocation-slider";
import { OverBudgetAlert } from "@/features/planning/components/over-budget-alert";

function renderAlert(
  props: { section: "expenses" | "goals"; revenueCents: number; totalCents: number },
  essentialPercentage = 50,
) {
  return render(
    <AllocationProvider initialEssentialPercentage={essentialPercentage}>
      <AllocationSlider revenueCents={600000} />
      <OverBudgetAlert {...props} />
    </AllocationProvider>,
  );
}

describe("OverBudgetAlert", () => {
  it("alerta quando o Momento Presente excede o planejado, informando o excesso", () => {
    renderAlert({ section: "expenses", revenueCents: 400000, totalCents: 210000 });
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Planejamento incorreto");
    expect(alert).toHaveTextContent("O Momento Presente excede o planejado em R$ 100,00");
  });

  it("não alerta quando a soma é igual ao planejado", () => {
    renderAlert({ section: "expenses", revenueCents: 400000, totalCents: 200000 });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("alerta com receita zero e qualquer valor cadastrado", () => {
    renderAlert({ section: "goals", revenueCents: 0, totalCents: 1 });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "O Momento Futuro excede o planejado em R$ 0,01",
    );
  });

  it("usa 100 − porcentagem para metas futuras", () => {
    // 70% para gastos → 30% (R$ 1.200,00) para metas; metas somam R$ 1.300,00
    renderAlert({ section: "goals", revenueCents: 400000, totalCents: 130000 }, 70);
    expect(screen.getByRole("alert")).toHaveTextContent("O Momento Futuro excede o planejado em R$ 100,00");
  });

  it("aparece e some em tempo real conforme o slider se move", async () => {
    // 50% de R$ 4.000,00 = R$ 2.000,00; gastos de R$ 2.010,00 → alerta
    renderAlert({ section: "expenses", revenueCents: 400000, totalCents: 201000 });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    // 51% = R$ 2.040,00 → sem alerta
    await act(async () => {
      fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    // de volta para 50% → alerta de novo
    await act(async () => {
      fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowLeft" });
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
