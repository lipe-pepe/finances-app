import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

// O jsdom não mede layout, então o Recharts não desenha os traços; os componentes de série
// viram marcadores simples para conferir o que é desenhado
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return {
    ...actual,
    ComposedChart: ({ children }: { children: ReactNode }) => <div data-testid="chart">{children}</div>,
    Area: (props: { dataKey?: string; type?: string; stroke?: string }) => (
      <div data-testid="area" data-key={props.dataKey} data-type={props.type} data-stroke={props.stroke} />
    ),
    Line: (props: { dataKey?: string; type?: string; stroke?: string }) => (
      <div data-testid="line" data-key={props.dataKey} data-type={props.type} data-stroke={props.stroke} />
    ),
    ReferenceLine: (props: { y?: number; stroke?: string; strokeDasharray?: string }) => (
      <div data-testid="limit" data-y={props.y} data-stroke={props.stroke} data-dash={props.strokeDasharray} />
    ),
    ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    CartesianGrid: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
  };
});

import { SpendingChart } from "@/features/control/components/spending-chart";
import { PRESENT_PARTS } from "@/lib/present-parts";

const SERIES = [
  { day: 1, essentials: 40000, education: 0, free: 0 },
  { day: 2, essentials: 120000, education: 10000, free: 60000 },
  { day: 3, essentials: null, education: null, free: null },
];
const LIMITS = { essentials: 600000, education: 50000, free: 50000 };

describe("SpendingChart (feature 006)", () => {
  it("sem parte ativa, desenha três curvas e três limites tracejados nas cores das partes (FR-017–FR-019)", () => {
    render(<SpendingChart series={SERIES} parts={PRESENT_PARTS} limits={LIMITS} monthLabel="Novembro de 2026" />);
    const lines = screen.getAllByTestId("line");
    expect(lines.map((line) => line.dataset.key)).toEqual(["essentials", "education", "free"]);
    expect(lines.every((line) => line.dataset.type === "stepAfter")).toBe(true);
    expect(lines[1]).toHaveAttribute("data-stroke", "var(--part-education)");
    const limits = screen.getAllByTestId("limit");
    expect(limits.map((limit) => limit.dataset.y)).toEqual(["600000", "50000", "50000"]);
    expect(limits[1]).toHaveAttribute("data-stroke", "var(--part-education)");
    expect(limits.every((limit) => limit.dataset.dash === "6 5")).toBe(true);
    expect(screen.queryByTestId("area")).not.toBeInTheDocument();
  });

  it("tem legenda com o nome e o limite de cada parte", () => {
    render(<SpendingChart series={SERIES} parts={PRESENT_PARTS} limits={LIMITS} monthLabel="Novembro de 2026" />);
    expect(screen.getByTestId("chart-legend-essentials")).toHaveTextContent("Gastos Essenciais");
    expect(screen.getByTestId("chart-legend-essentials")).toHaveTextContent("Limite R$ 6.000,00");
    expect(screen.getByTestId("chart-legend-education")).toHaveTextContent("Limite R$ 500,00");
    expect(screen.getByTestId("chart-legend-free")).toHaveTextContent("Livre");
  });

  it("descreve cada parte em texto e indica a parte acima do limite (FR-020)", () => {
    render(<SpendingChart series={SERIES} parts={PRESENT_PARTS} limits={LIMITS} monthLabel="Novembro de 2026" />);
    const figure = screen.getByRole("img");
    const name = figure.getAttribute("aria-labelledby");
    const caption = document.getElementById(name ?? "");
    expect(caption).toHaveClass("sr-only");
    expect(caption).toHaveTextContent(
      "Gastos Essenciais: gasto acumulado de R$ 1.200,00 de um limite de R$ 6.000,00.",
    );
    expect(caption).toHaveTextContent(
      "Livre: gasto acumulado de R$ 600,00 de um limite de R$ 500,00. Acima do limite.",
    );
  });

  it("com uma parte ativa, mostra só ela como área (FR-028)", () => {
    render(<SpendingChart series={SERIES} parts={["education"]} limits={LIMITS} monthLabel="Novembro de 2026" />);
    expect(screen.getByTestId("area")).toHaveAttribute("data-key", "education");
    expect(screen.queryByTestId("line")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("limit")).toHaveLength(1);
    expect(screen.queryByTestId("chart-legend-essentials")).not.toBeInTheDocument();
    expect(screen.getByTestId("chart-legend-education")).toBeInTheDocument();
  });

  it("renderiza sem gastos e sem limites", () => {
    render(
      <SpendingChart
        series={[{ day: 1, essentials: 0, education: 0, free: 0 }]}
        parts={PRESENT_PARTS}
        limits={{ essentials: 0, education: 0, free: 0 }}
        monthLabel="Novembro de 2026"
      />,
    );
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});
