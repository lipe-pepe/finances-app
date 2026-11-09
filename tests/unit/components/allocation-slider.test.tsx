import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const saveAllocation = vi.fn();
const push = vi.fn();
vi.mock("@/features/allocation/actions", () => ({
  saveAllocation: (...args: unknown[]) => saveAllocation(...args),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }));

import { AllocationProvider } from "@/features/allocation/components/allocation-provider";
import { AllocationSlider } from "@/features/allocation/components/allocation-slider";
import { PlannedAmount } from "@/features/allocation/components/planned-amount";

function renderSlider(initial = 70, revenueCents = 600000) {
  return render(
    <AllocationProvider initialEssentialPercentage={initial}>
      <AllocationSlider />
      <PlannedAmount section="expenses" revenueCents={revenueCents} />
      <PlannedAmount section="goals" revenueCents={revenueCents} />
    </AllocationProvider>,
  );
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

describe("AllocationSlider + PlannedAmount", () => {
  beforeEach(() => {
    saveAllocation.mockReset();
    push.mockReset();
  });

  it("exibe as porcentagens e os valores planejados", () => {
    renderSlider(70, 600000);
    expect(screen.getByText("Momento Presente 70%")).toBeInTheDocument();
    expect(screen.getByText("Momento Futuro 30%")).toBeInTheDocument();
    expect(screen.getByTestId("planned-expenses")).toHaveTextContent("R$ 4.200,00");
    expect(screen.getByTestId("planned-goals")).toHaveTextContent("R$ 1.800,00");
  });

  it("identifica o slider pelo nome dos dois momentos", () => {
    renderSlider(70);
    expect(
      screen.getByRole("slider", { name: "Divisão entre Momento Presente e Momento Futuro" }),
    ).toBeInTheDocument();
  });

  it("com showSectionLabel, mostra o nome do momento junto ao valor planejado", () => {
    render(
      <AllocationProvider initialEssentialPercentage={70}>
        <PlannedAmount section="expenses" revenueCents={600000} showSectionLabel />
        <PlannedAmount section="goals" revenueCents={600000} showSectionLabel />
        <PlannedAmount section="expenses" revenueCents={600000} />
      </AllocationProvider>,
    );
    const [expenses, goals, plain] = [
      ...screen.getAllByTestId("planned-expenses"),
      ...screen.getAllByTestId("planned-goals"),
    ].sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    expect(expenses).toHaveTextContent("Momento Presente: R$ 4.200,00 (70% da receita)");
    expect(goals).toHaveTextContent("Momento Futuro: R$ 1.800,00 (30% da receita)");
    expect(plain).toHaveTextContent("Planejado (70% da receita): R$ 4.200,00");
  });

  it("atualiza em tempo real e salva uma vez ao soltar (teclado = mover + soltar)", async () => {
    saveAllocation.mockResolvedValue({ ok: true, data: { essentialPercentage: 71 } });
    renderSlider(70);
    const slider = screen.getByRole("slider");
    await act(async () => {
      fireEvent.keyDown(slider, { key: "ArrowRight" });
    });
    expect(screen.getByText("Momento Presente 71%")).toBeInTheDocument();
    expect(screen.getByTestId("planned-expenses")).toHaveTextContent("R$ 4.260,00");
    expect(saveAllocation).toHaveBeenCalledTimes(1);
    expect(saveAllocation).toHaveBeenCalledWith({ essentialPercentage: 71 });
    expect(await screen.findByText("Salvo")).toBeInTheDocument();
  });

  it("só o último commit define o estado de salvo", async () => {
    const first = deferred<unknown>();
    const second = deferred<unknown>();
    saveAllocation.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    renderSlider(50);
    const slider = screen.getByRole("slider");
    await act(async () => {
      fireEvent.keyDown(slider, { key: "ArrowRight" });
      fireEvent.keyDown(slider, { key: "ArrowRight" });
    });
    // A resposta mais recente chega primeiro; a antiga, com erro, deve ser ignorada
    await act(async () => {
      second.resolve({ ok: true, data: { essentialPercentage: 52 } });
    });
    await act(async () => {
      first.resolve({ ok: false, error: { code: "UNKNOWN" } });
    });
    expect(screen.getByText("Salvo")).toBeInTheDocument();
    expect(screen.queryByText(/Divisão não salva/)).not.toBeInTheDocument();
  });

  it("mostra aviso e permite tentar novamente quando o salvamento falha", async () => {
    saveAllocation
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce({ ok: true, data: { essentialPercentage: 71 } });
    renderSlider(70);
    await act(async () => {
      fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
    });
    expect(await screen.findByText("Divisão não salva")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(saveAllocation).toHaveBeenLastCalledWith({ essentialPercentage: 71 });
    expect(await screen.findByText("Salvo")).toBeInTheDocument();
  });

  it("redireciona para /login quando a sessão expirou", async () => {
    saveAllocation.mockResolvedValue({ ok: false, error: { code: "UNAUTHENTICATED" } });
    renderSlider(70);
    await act(async () => {
      fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowLeft" });
    });
    expect(push).toHaveBeenCalledWith("/login");
  });
});
