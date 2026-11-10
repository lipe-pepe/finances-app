import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

// O jsdom não mede layout, então o Recharts não desenha os traços; os componentes de série
// viram marcadores simples para conferir qual tipo de gráfico é usado
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return {
    ...actual,
    AreaChart: ({ children }: { children: ReactNode }) => <div data-testid="area-chart">{children}</div>,
    Area: (props: { type?: string; fill?: string }) => (
      <div data-testid="area" data-type={props.type} data-fill={props.fill} />
    ),
    ReferenceLine: (props: { stroke?: string }) => <div data-testid="limit" data-stroke={props.stroke} />,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CartesianGrid: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
  };
});

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
    expect(screen.getByText("Limite R$ 1.500,00")).toBeInTheDocument();
  });

  it("desenha o gasto como área, sem linha simples", () => {
    render(
      <SpendingChart
        series={[
          { day: 1, spentCents: 40000 },
          { day: 2, spentCents: 75000 },
        ]}
        plannedCents={150000}
        spentCents={75000}
        monthLabel="Novembro de 2026"
      />,
    );
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    expect(screen.getByTestId("area")).toHaveAttribute("data-type", "stepAfter");
    expect(screen.getByTestId("area")).toHaveAttribute("data-fill", "var(--brand-soft)");
    expect(screen.getByTestId("limit")).toHaveAttribute("data-stroke", "var(--chart-limit)");
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
