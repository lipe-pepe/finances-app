"use client";
// Client Component: o Recharts mede o layout e desenha o gráfico no navegador.

import { useId } from "react";
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CHART_LIMIT_LABEL, SUMMARY_LABELS } from "@/lib/control-labels";
import { formatBrl } from "@/lib/money";
import { PART_LABELS, partChartSummary } from "@/lib/part-labels";
import {
  PRESENT_PARTS,
  type PartCents,
  type PartSeriesPoint,
  type PresentPart,
} from "@/lib/present-parts";

/** Cor de cada parte (token do tema; feature 006, FR-019). */
const PART_STROKES: Record<PresentPart, string> = {
  essentials: "var(--part-essentials)",
  education: "var(--part-education)",
  free: "var(--part-free)",
};

const PART_BORDER_CLASSES: Record<PresentPart, string> = {
  essentials: "border-part-essentials",
  education: "border-part-education",
  free: "border-part-free",
};

const chartConfig = Object.fromEntries(
  PRESENT_PARTS.map((part) => [part, { label: PART_LABELS[part], color: PART_STROKES[part] }]),
) satisfies ChartConfig;

type SpendingChartProps = {
  series: PartSeriesPoint[];
  /** Partes exibidas: as três (sem parte ativa) ou só a parte ativa */
  parts: readonly PresentPart[];
  /** Limite de cada parte (valor da parte, independente da categoria) */
  limits: PartCents;
  monthLabel: string;
};

/** Último valor acumulado de uma parte na série (gasto do mês até hoje). */
function lastValue(series: PartSeriesPoint[], part: PresentPart): number {
  for (let index = series.length - 1; index >= 0; index -= 1) {
    const value = series[index][part];
    if (value !== null) return value;
  }
  return 0;
}

/**
 * Gasto acumulado por dia de cada parte, com a linha de limite tracejada da parte na mesma cor
 * (feature 006, FR-017–FR-019). Com uma parte só, a curva é uma área preenchida.
 * O gráfico é uma imagem para tecnologias assistivas, nomeada pelo resumo textual (FR-020); por
 * isso a camada de navegação por teclado do Recharts não é usada.
 */
export function SpendingChart({ series, parts, limits, monthLabel }: SpendingChartProps) {
  const captionId = useId();
  const single = parts.length === 1;
  const maxLimit = Math.max(0, ...parts.map((part) => limits[part]));
  const summary = [
    monthLabel,
    ...parts.map((part) =>
      partChartSummary({ part, spentCents: lastValue(series, part), limitCents: limits[part] }),
    ),
  ].join(". ");

  return (
    <figure className="flex flex-col gap-3">
      <div role="img" aria-labelledby={captionId}>
        <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
          <ComposedChart data={series} margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={80}
              tickFormatter={(value: number) => formatBrl(value)}
              domain={[0, (dataMax: number) => Math.max(dataMax, maxLimit)]}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => `Dia ${payload?.[0]?.payload?.day ?? ""}`}
                  formatter={(value, name) =>
                    `${PART_LABELS[name as PresentPart] ?? SUMMARY_LABELS.spent}: ${formatBrl(Number(value))}`
                  }
                />
              }
            />
            {parts.map((part) => (
              <ReferenceLine
                key={`limit-${part}`}
                y={limits[part]}
                stroke={PART_STROKES[part]}
                strokeWidth={1.5}
                strokeDasharray="6 5"
              />
            ))}
            {parts.map((part) =>
              single ? (
                <Area
                  key={part}
                  dataKey={part}
                  type="stepAfter"
                  stroke={PART_STROKES[part]}
                  strokeWidth={2.5}
                  fill={PART_STROKES[part]}
                  fillOpacity={0.15}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              ) : (
                <Line
                  key={part}
                  dataKey={part}
                  type="stepAfter"
                  stroke={PART_STROKES[part]}
                  strokeWidth={2.5}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              ),
            )}
          </ComposedChart>
        </ChartContainer>
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
        {parts.map((part) => (
          <li key={part} data-testid={`chart-legend-${part}`} className="flex items-center gap-2">
            <span aria-hidden="true" className={`w-4 border-t-4 ${PART_BORDER_CLASSES[part]}`} />
            <span className="font-medium text-foreground">{PART_LABELS[part]}</span>
            <span aria-hidden="true" className={`w-4 border-t-2 border-dashed ${PART_BORDER_CLASSES[part]}`} />
            <span>
              {CHART_LIMIT_LABEL} {formatBrl(limits[part])}
            </span>
          </li>
        ))}
      </ul>
      <figcaption id={captionId} className="sr-only">
        {summary}
      </figcaption>
    </figure>
  );
}
