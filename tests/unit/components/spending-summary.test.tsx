import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpendingSummary } from "@/features/control/components/spending-summary";

function valueOf(label: string): HTMLElement {
  return screen.getByText(label).nextSibling as HTMLElement;
}

describe("SpendingSummary", () => {
  it("destaca o disponível e mostra gasto, planejado, uso e a barra", () => {
    const { container } = render(<SpendingSummary plannedCents={150000} spentCents={75000} />);
    const available = valueOf("Disponível");
    expect(available).toHaveTextContent("R$ 750,00");
    expect(available).toHaveClass("text-display");
    expect(available).not.toHaveClass("text-destructive");
    expect(valueOf("Gasto")).toHaveTextContent("R$ 750,00");
    expect(valueOf("Planejado")).toHaveTextContent("R$ 1.500,00");
    expect(valueOf("Usado")).toHaveTextContent("50%");
    const fill = container.querySelector('[aria-hidden="true"].bg-muted > div') as HTMLElement;
    expect(fill.style.width).toBe("50%");
    expect(fill).toHaveClass("bg-primary");
    expect(screen.queryByText(/Acima do limite/)).not.toBeInTheDocument();
  });

  it("destaca o disponível negativo com alerta e barra cheia", () => {
    const { container } = render(<SpendingSummary plannedCents={150000} spentCents={160500} />);
    const available = valueOf("Disponível");
    expect(available).toHaveTextContent("-R$ 105,00");
    expect(available).toHaveClass("text-destructive");
    expect(screen.getByText("Acima do limite em R$ 105,00")).toBeInTheDocument();
    expect(valueOf("Usado")).toHaveTextContent("107%");
    const fill = container.querySelector('[aria-hidden="true"].bg-muted > div') as HTMLElement;
    expect(fill.style.width).toBe("100%");
    expect(fill).toHaveClass("bg-destructive");
  });

  it("mostra o uso indefinido quando não há planejado", () => {
    render(<SpendingSummary plannedCents={0} spentCents={100} />);
    expect(valueOf("Usado")).toHaveTextContent("—");
  });
});
