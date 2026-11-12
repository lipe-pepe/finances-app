import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PartUsageBar } from "@/features/control/components/part-usage-bar";
import type { PresentPart } from "@/lib/present-parts";

const SPENT = { essentials: 120000, education: 10000, free: 5000 };
const PERCENTAGES = { essentials: 60, education: 5, free: 5 };

function renderBar(activePart: PresentPart | null = null, spent = SPENT) {
  const onToggle = vi.fn();
  render(
    <PartUsageBar
      spentByPart={spent}
      limitCents={700000}
      percentages={PERCENTAGES}
      activePart={activePart}
      onToggle={onToggle}
    />,
  );
  return onToggle;
}

describe("PartUsageBar (US5)", () => {
  it("tem um trecho por parte, na cor da parte e com largura pelo gasto (FR-024)", () => {
    renderBar();
    const essentials = screen.getByTestId("part-segment-essentials");
    expect(essentials).toHaveClass("bg-part-essentials");
    expect(parseFloat(essentials.style.width)).toBeCloseTo(17.14, 1);
    expect(screen.getByTestId("part-segment-education")).toHaveClass("bg-part-education");
    expect(screen.getByTestId("part-segment-free")).toHaveClass("bg-part-free");
  });

  it("a legenda tem botões alternáveis com nome, % e gasto (FR-027, FR-030)", () => {
    renderBar();
    const education = screen.getByRole("button", { name: "Educação, 5% da Receita, gasto R$ 100,00" });
    expect(education).toHaveAttribute("aria-pressed", "false");
    expect(education).toHaveClass("min-h-11");
    expect(screen.getAllByRole("button", { pressed: false })).toHaveLength(3);
  });

  it("clicar no botão da legenda ou no trecho chama onToggle (FR-026)", async () => {
    const onToggle = renderBar();
    await userEvent.click(screen.getByRole("button", { name: /^Educação,/ }));
    expect(onToggle).toHaveBeenCalledWith("education");
    await userEvent.click(screen.getByTestId("part-segment-free"));
    expect(onToggle).toHaveBeenLastCalledWith("free");
  });

  it("destaca a parte ativa e atenua os outros trechos (FR-030)", () => {
    renderBar("education");
    expect(screen.getByRole("button", { name: /^Educação,/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("part-segment-essentials")).toHaveClass("opacity-40");
    expect(screen.getByTestId("part-segment-education")).not.toHaveClass("opacity-40");
  });

  it("mostra o tooltip com nome e porcentagem ao focar (FR-025)", async () => {
    renderBar();
    await userEvent.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Gastos Essenciais · 60% da Receita");
  });

  it("parte sem gasto não tem trecho, mas continua ativável pela legenda", async () => {
    const onToggle = renderBar(null, { essentials: 120000, education: 0, free: 0 });
    expect(screen.queryByTestId("part-segment-education")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /^Educação,/ }));
    expect(onToggle).toHaveBeenCalledWith("education");
  });
});
