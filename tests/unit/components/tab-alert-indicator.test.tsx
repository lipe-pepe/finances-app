import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/allocation/actions", () => ({
  saveAllocation: vi.fn().mockResolvedValue({ ok: true, data: { essentialPercentage: 50 } }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

import { AllocationProvider } from "@/features/allocation/components/allocation-provider";
import { AllocationSlider } from "@/features/allocation/components/allocation-slider";
import { TabAlertIndicator } from "@/features/planning/components/tab-alert-indicator";

function renderIndicator(
  props: { section: "expenses" | "goals"; revenueCents: number; totalCents: number },
  essentialPercentage = 50,
) {
  return render(
    <AllocationProvider initialEssentialPercentage={essentialPercentage}>
      <AllocationSlider />
      <span data-testid="indicator">
        <TabAlertIndicator {...props} />
      </span>
    </AllocationProvider>,
  );
}

async function press(key: string, times = 1) {
  for (let i = 0; i < times; i++) {
    await act(async () => {
      fireEvent.keyDown(screen.getByRole("slider"), { key });
    });
  }
}

describe("TabAlertIndicator", () => {
  it("mostra ícone decorativo e texto acessível quando a seção excede o planejado", () => {
    renderIndicator({ section: "expenses", revenueCents: 400000, totalCents: 210000 });
    const indicator = screen.getByTestId("indicator");
    expect(indicator).toHaveTextContent(", com alerta");
    expect(indicator.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("não mostra nada quando a soma é igual ao planejado", () => {
    renderIndicator({ section: "expenses", revenueCents: 400000, totalCents: 200000 });
    expect(screen.getByTestId("indicator")).toBeEmptyDOMElement();
  });

  it("aparece e some em tempo real conforme o slider", async () => {
    renderIndicator({ section: "expenses", revenueCents: 400000, totalCents: 210000 });
    // 55% de R$ 4.000,00 = R$ 2.200,00 → sem alerta
    await press("ArrowRight", 5);
    expect(screen.getByTestId("indicator")).toBeEmptyDOMElement();
    // de volta a 50% → alerta
    await press("ArrowLeft", 5);
    expect(screen.getByTestId("indicator")).toHaveTextContent(", com alerta");
  });

  it("usa 100 − porcentagem para o Momento Futuro", () => {
    // 70% para o Momento Presente → 30% (R$ 1.200,00) para o Futuro; metas somam R$ 1.300,00
    renderIndicator({ section: "goals", revenueCents: 400000, totalCents: 130000 }, 70);
    expect(screen.getByTestId("indicator")).toHaveTextContent(", com alerta");
  });
});
