import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const savePresentSplit = vi.fn();
vi.mock("@/features/allocation/actions", () => ({
  savePresentSplit: (...args: unknown[]) => savePresentSplit(...args),
  saveAllocation: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

import { AllocationProvider } from "@/features/allocation/components/allocation-provider";
import { PresentSplitSlider } from "@/features/allocation/components/present-split-slider";

function renderSplit(present = 70, education = 5, free = 5, revenueCents = 1_000_000) {
  return render(
    <AllocationProvider
      initialEssentialPercentage={present}
      initialEducationPercentage={education}
      initialFreePercentage={free}
    >
      <PresentSplitSlider revenueCents={revenueCents} />
    </AllocationProvider>,
  );
}

describe("PresentSplitSlider (US1)", () => {
  beforeEach(() => {
    savePresentSplit.mockReset();
  });

  it("mostra o total e as três partes com % e valor (FR-001, FR-004)", () => {
    renderSplit();
    expect(screen.getByText("70% da Receita · R$ 7.000,00")).toBeInTheDocument();
    expect(screen.getByTestId("split-essentials")).toHaveTextContent("Gastos Essenciais 60%");
    expect(screen.getByTestId("split-essentials")).toHaveTextContent("R$ 6.000,00");
    expect(screen.getByTestId("split-education")).toHaveTextContent("Educação 5%");
    expect(screen.getByTestId("split-education")).toHaveTextContent("R$ 500,00");
    expect(screen.getByTestId("split-free")).toHaveTextContent("Livre 5%");
    expect(screen.getByTestId("split-free")).toHaveTextContent("R$ 500,00");
  });

  it("tem duas divisões com nomes acessíveis e máximo no Momento Presente (FR-002, FR-009)", () => {
    renderSplit();
    const first = screen.getByRole("slider", { name: "Divisão entre Gastos Essenciais e Educação" });
    const second = screen.getByRole("slider", { name: "Divisão entre Educação e Livre" });
    expect(first).toHaveAttribute("aria-valuemax", "70");
    expect(first).toHaveAttribute("aria-valuetext", "Gastos Essenciais 60%, Educação 5%");
    expect(second).toHaveAttribute("aria-valuenow", "65");
  });

  it("ajusta pelo teclado em tempo real e salva no commit (FR-004, FR-005)", async () => {
    savePresentSplit.mockResolvedValue({
      ok: true,
      data: { parts: { essentials: 61, education: 4, free: 5 } },
    });
    renderSplit();
    await act(async () => {
      fireEvent.keyDown(screen.getByRole("slider", { name: "Divisão entre Gastos Essenciais e Educação" }), {
        key: "ArrowRight",
      });
    });
    expect(screen.getByTestId("split-essentials")).toHaveTextContent("Gastos Essenciais 61%");
    expect(screen.getByTestId("split-education")).toHaveTextContent("Educação 4%");
    expect(savePresentSplit).toHaveBeenCalledWith({ educationPercentage: 4, freePercentage: 5 });
    expect(await screen.findByText("Salvo")).toBeInTheDocument();
  });

  it("sem Momento Presente, desabilita o slider e explica onde ajustar (FR-010)", () => {
    renderSplit(0, 0, 0);
    for (const slider of screen.getAllByRole("slider")) {
      expect(slider).toHaveAttribute("data-disabled");
    }
    expect(screen.getByText("Defina a porcentagem do Momento Presente na aba Receita.")).toBeInTheDocument();
  });

  it("avisa quando o salvamento falha (FR-006)", async () => {
    savePresentSplit.mockResolvedValue({ ok: false, error: { code: "UNKNOWN" } });
    renderSplit();
    await act(async () => {
      fireEvent.keyDown(screen.getByRole("slider", { name: "Divisão entre Educação e Livre" }), {
        key: "ArrowLeft",
      });
    });
    expect(await screen.findByText("Divisão não salva")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });
});
