import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpendingChart } from "@/features/control/components/spending-chart";

const SUMMARY = "Gasto acumulado de R$ 750,00 de um limite de R$ 1.500,00 em Novembro de 2026";

describe("SpendingChart", () => {
  it("expõe o resumo do gráfico para leitores de tela", () => {
    render(
      <SpendingChart
        series={[
          { day: 1, spentCents: 40000 },
          { day: 2, spentCents: 75000 },
          { day: 3, spentCents: null },
        ]}
        plannedCents={150000}
        spentCents={75000}
        monthLabel="Novembro de 2026"
      />,
    );
    expect(screen.getByRole("img", { name: SUMMARY })).toBeInTheDocument();
    expect(screen.getByText(SUMMARY)).toHaveClass("sr-only");
  });

  it("renderiza sem gastos e sem planejado", () => {
    render(
      <SpendingChart
        series={[
          { day: 1, spentCents: 0 },
          { day: 2, spentCents: null },
        ]}
        plannedCents={0}
        spentCents={0}
        monthLabel="Novembro de 2026"
      />,
    );
    expect(
      screen.getByRole("img", {
        name: "Gasto acumulado de R$ 0,00 de um limite de R$ 0,00 em Novembro de 2026",
      }),
    ).toBeInTheDocument();
  });
});
