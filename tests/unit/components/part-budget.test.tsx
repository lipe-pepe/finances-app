import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AllocationProvider } from "@/features/allocation/components/allocation-provider";
import { PartBudget } from "@/features/expenses/components/part-budget";
import type { PresentPart } from "@/lib/present-parts";

function renderBudget(part: PresentPart, plannedCents: number) {
  return render(
    <AllocationProvider initialEssentialPercentage={70} initialEducationPercentage={5} initialFreePercentage={5}>
      <PartBudget part={part} revenueCents={1_000_000} plannedCents={plannedCents} />
    </AllocationProvider>,
  );
}

describe("PartBudget (feature 007)", () => {
  it("mostra só a parte recebida, com planejado × valor (FR-009)", () => {
    renderBudget("education", 40000);
    expect(screen.getByTestId("part-budget-education")).toHaveTextContent("Planejado R$ 400,00 de R$ 500,00");
    expect(screen.getByText("Educação")).toBeInTheDocument();
    expect(screen.queryByText("Gastos Essenciais")).not.toBeInTheDocument();
    expect(screen.queryByText("Livre")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("alerta a parte excedida com o valor do excesso (FR-014 da feature 006)", () => {
    renderBudget("education", 60000);
    expect(screen.getByRole("alert")).toHaveTextContent("Educação excede o valor da parte em R$ 100,00");
  });

  it("não alerta quando o planejado é igual ao valor da parte", () => {
    renderBudget("education", 50000);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
