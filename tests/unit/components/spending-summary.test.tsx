import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpendingSummary } from "@/features/control/components/spending-summary";

function valueOf(label: string): HTMLElement {
  return screen.getByText(label).nextSibling as HTMLElement;
}

describe("SpendingSummary", () => {
  it("destaca o disponível e mostra gasto, limite e uso (feature 006, FR-029)", () => {
    const { container } = render(<SpendingSummary limitCents={150000} spentCents={75000} />);
    const available = valueOf("Disponível");
    expect(available).toHaveTextContent("R$ 750,00");
    expect(available).toHaveClass("text-display");
    expect(available).not.toHaveClass("text-destructive");
    expect(valueOf("Gasto")).toHaveTextContent("R$ 750,00");
    expect(valueOf("Limite")).toHaveTextContent("R$ 1.500,00");
    expect(screen.queryByText("Planejado")).not.toBeInTheDocument();
    expect(valueOf("Usado")).toHaveTextContent("50%");
    // A barra de uso agora é a barra por parte, acima do resumo (FR-024)
    expect(container.querySelector('[aria-hidden="true"].bg-muted')).toBeNull();
    expect(screen.queryByText(/Acima do limite/)).not.toBeInTheDocument();
  });

  it("destaca o disponível negativo com alerta", () => {
    render(<SpendingSummary limitCents={150000} spentCents={160500} />);
    const available = valueOf("Disponível");
    expect(available).toHaveTextContent("-R$ 105,00");
    expect(available).toHaveClass("text-destructive");
    expect(screen.getByText("Acima do limite em R$ 105,00")).toBeInTheDocument();
    expect(valueOf("Usado")).toHaveTextContent("107%");
  });

  it("mostra o uso indefinido quando o limite é zero", () => {
    render(<SpendingSummary limitCents={0} spentCents={100} />);
    expect(valueOf("Usado")).toHaveTextContent("—");
  });
});
