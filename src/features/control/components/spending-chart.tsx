"use client";
// Client Component: o Recharts mede o layout e desenha o gráfico no navegador.

import { useId } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CHART_LIMIT_LABEL, SUMMARY_LABELS, chartSummary } from "@/lib/control-labels";
import { formatBrl } from "@/lib/money";

const SPENT_STROKE = "var(--primary)";
const SPENT_FILL = "var(--brand-soft)";
const LIMIT_STROKE = "var(--chart-limit)";
import type { SeriesPoint } from "@/lib/spending";

const chartConfig = {
  spentCents: { label: SUMMARY_LABELS.spent, color: SPENT_STROKE },
} satisfies ChartConfig;

type SpendingChartProps = {
  series: SeriesPoint[];
  plannedCents: number;
  spentCents: number;
  monthLabel: string;
};

/**
 * Gasto acumulado por dia do mês como área, com a linha de limite tracejada no valor planejado
 * (FR-010; cores = tokens do tema).
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
          <AreaChart data={series} margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
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
            <ReferenceLine y={plannedCents} stroke={LIMIT_STROKE} strokeWidth={2} strokeDasharray="6 5" />
            <Area
              dataKey="spentCents"
              type="stepAfter"
              stroke={SPENT_STROKE}
              strokeWidth={2.5}
              fill={SPENT_FILL}
              fillOpacity={1}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span aria-hidden="true">1</span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="w-4 border-t-2 border-dashed border-chart-limit" />
          {CHART_LIMIT_LABEL} {formatBrl(plannedCents)}
        </span>
        <span aria-hidden="true">{series.length}</span>
      </div>
      <figcaption id={captionId} className="sr-only">
        {summary}
      </figcaption>
    </figure>
  );
}
