import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpendingSummary } from "@/features/control/components/spending-summary";

describe("SpendingSummary", () => {
  it("mostra planejado, gasto e disponível sem destaque quando dentro do limite", () => {
    render(<SpendingSummary plannedCents={150000} spentCents={75000} />);
    expect(screen.getByText("Planejado").nextSibling).toHaveTextContent("R$ 1.500,00");
    expect(screen.getByText("Gasto").nextSibling).toHaveTextContent("R$ 750,00");
    const available = screen.getByText("Disponível").nextSibling;
    expect(available).toHaveTextContent("R$ 750,00");
    expect(available).not.toHaveClass("text-destructive");
    expect(screen.queryByText(/Acima do limite/)).not.toBeInTheDocument();
  });

  it("destaca o disponível negativo", () => {
    render(<SpendingSummary plannedCents={150000} spentCents={160000} />);
    const available = screen.getByText("Disponível").nextSibling;
    expect(available).toHaveTextContent("-R$ 100,00");
    expect(available).toHaveClass("text-destructive");
    expect(screen.getByText("Acima do limite em R$ 100,00")).toHaveClass("text-destructive");
  });
});
