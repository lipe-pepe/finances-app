import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AllocationProvider } from "@/features/allocation/components/allocation-provider";
import { PartBudgetList } from "@/features/expenses/components/part-budget-list";
import type { PartCents } from "@/lib/present-parts";

function renderList(planned: Partial<PartCents>) {
  return render(
    <AllocationProvider initialEssentialPercentage={70} initialEducationPercentage={5} initialFreePercentage={5}>
      <PartBudgetList
        revenueCents={1_000_000}
        plannedCentsByPart={{ essentials: 0, education: 0, free: 0, ...planned }}
      />
    </AllocationProvider>,
  );
}

describe("PartBudgetList (US2)", () => {
  it("mostra as três partes em ordem, com planejado × valor (FR-013)", () => {
    renderList({ education: 40000 });
    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.dataset.testid)).toEqual([
      "part-budget-essentials",
      "part-budget-education",
      "part-budget-free",
    ]);
    expect(screen.getByTestId("part-budget-education")).toHaveTextContent("Planejado R$ 400,00 de R$ 500,00");
    expect(screen.getByTestId("part-budget-essentials")).toHaveTextContent("de R$ 6.000,00");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("alerta a parte excedida com o valor do excesso (FR-014)", () => {
    renderList({ education: 60000 });
    expect(screen.getByRole("alert")).toHaveTextContent("Educação excede o valor da parte em R$ 100,00");
  });

  it("não alerta quando o planejado é igual ao valor da parte", () => {
    renderList({ education: 50000 });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
