"use client";
// Client Component: o Recharts mede o layout e desenha o gráfico no navegador.

import { useId } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CHART_LIMIT_LABEL, SUMMARY_LABELS, chartSummary } from "@/lib/control-labels";
import { formatBrl } from "@/lib/money";
import type { SeriesPoint } from "@/lib/spending";

const chartConfig = {
  spentCents: { label: SUMMARY_LABELS.spent, color: "var(--chart-2)" },
} satisfies ChartConfig;

type SpendingChartProps = {
  series: SeriesPoint[];
  plannedCents: number;
  spentCents: number;
  monthLabel: string;
};

/**
 * Gasto acumulado por dia do mês, com a linha de limite no valor planejado (FR-018).
 * O gráfico é uma imagem para tecnologias assistivas, nomeada pelo resumo textual (FR-019); por
 * isso a camada de navegação por teclado do Recharts não é usada.
 */
export function SpendingChart({ series, plannedCents, spentCents, monthLabel }: SpendingChartProps) {
  const captionId = useId();
  const summary = chartSummary({ spentCents, plannedCents, monthLabel });

  return (
    <figure className="flex flex-col gap-2">
      <div role="img" aria-labelledby={captionId}>
        <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
          <LineChart data={series} margin={{ top: 16, right: 16, bottom: 0, left: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={80}
              tickFormatter={(value: number) => formatBrl(value)}
              domain={[0, (dataMax: number) => Math.max(dataMax, plannedCents)]}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => `Dia ${payload?.[0]?.payload?.day ?? ""}`}
                  formatter={(value) => formatBrl(Number(value))}
                />
              }
            />
            <ReferenceLine
              y={plannedCents}
              stroke="var(--destructive)"
              strokeDasharray="4 4"
              label={{ value: CHART_LIMIT_LABEL, position: "insideTopRight", fill: "var(--destructive)" }}
            />
            <Line
              dataKey="spentCents"
              type="stepAfter"
              stroke="var(--color-spentCents)"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
      <figcaption id={captionId} className="sr-only">
        {summary}
      </figcaption>
    </figure>
  );
}
