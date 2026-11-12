"use client";
// Client Component: parte ativa, tooltip e cliques dependem de estado e eventos no navegador.

import { cn } from "cn";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PART_DOT_CLASSES } from "@/features/planning/components/part-picker";
import { PART_LABELS, partPercentLabel, partToggleLabel } from "@/lib/part-labels";
import {
  PRESENT_PARTS,
  getPartBarWidths,
  type PartCents,
  type PartPercentages,
  type PresentPart,
} from "@/lib/present-parts";

type PartUsageBarProps = {
  /** Gasto de cada parte na seleção de categoria */
  spentByPart: PartCents;
  /** Limite de todo o Momento Presente */
  limitCents: number;
  percentages: PartPercentages;
  activePart: PresentPart | null;
  onToggle: (part: PresentPart) => void;
};

/**
 * Barra de uso do Momento Presente com um trecho por parte (feature 006, FR-024–FR-030). Os trechos
 * respondem ao mouse e mostram o tooltip; o teclado e os leitores de tela usam a legenda, que tem
 * os mesmos botões alternáveis e alvos de 44 px (research R10).
 */
export function PartUsageBar({ spentByPart, limitCents, percentages, activePart, onToggle }: PartUsageBarProps) {
  const widths = getPartBarWidths(spentByPart, limitCents);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-col gap-2">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted" data-testid="part-usage-track">
          {PRESENT_PARTS.map((part) =>
            widths[part] > 0 ? (
              <Tooltip key={part}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-hidden="true"
                    tabIndex={-1}
                    data-testid={`part-segment-${part}`}
                    onClick={() => onToggle(part)}
                    className={cn(
                      "h-full shrink-0 border-x-2 border-background first:border-l-0 last:border-r-0",
                      PART_DOT_CLASSES[part],
                      activePart !== null && activePart !== part && "opacity-40",
                    )}
                    // A largura é um dado (proporção do gasto), não um valor de estilo fixo
                    style={{ width: `${widths[part]}%` }}
                  />
                </TooltipTrigger>
                <TooltipContent>{partPercentLabel(part, percentages[part])}</TooltipContent>
              </Tooltip>
            ) : null,
          )}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Partes do Momento Presente">
          {PRESENT_PARTS.map((part) => {
            const active = activePart === part;
            return (
              <Tooltip key={part}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-pressed={active}
                    aria-label={partToggleLabel(part, percentages[part], spentByPart[part])}
                    onClick={() => onToggle(part)}
                    className={cn(
                      "flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm transition-colors hover:bg-muted",
                      active ? "border-foreground bg-muted font-semibold ring-2 ring-ring" : "text-muted-foreground",
                    )}
                  >
                    <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", PART_DOT_CLASSES[part])} />
                    <span className="text-foreground">{PART_LABELS[part]}</span>
                    <span className="tabular-nums">{percentages[part]}%</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>{partPercentLabel(part, percentages[part])}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
