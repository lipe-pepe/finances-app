"use client";
// Client Component: o slider é arrastável e atualiza as partes em tempo real; o salvamento ao
// soltar depende de eventos do navegador.

import { cn } from "cn";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { savePresentSplit } from "@/features/allocation/actions";
import { useAllocation } from "@/features/allocation/components/allocation-provider";
import { PART_DOT_CLASSES } from "@/features/planning/components/part-picker";
import { runAction } from "@/lib/handle-action-result";
import { formatBrl } from "@/lib/money";
import {
  PART_LABELS,
  PRESENT_ZERO_HINT,
  partSplitValueText,
  presentTotalLabel,
  thumbLabel,
} from "@/lib/part-labels";
import { calculatePlannedCents } from "@/lib/planning";
import {
  PRESENT_PARTS,
  getPartCents,
  splitFromThumbs,
  thumbsFromSplit,
  type PartPercentages,
} from "@/lib/present-parts";

type PresentSplitSliderProps = {
  revenueCents: number;
};

/**
 * Divisão do Momento Presente em Gastos Essenciais, Educação e Livre (feature 006, US1): um slider
 * com duas divisões; as três partes somam a porcentagem do Momento Presente (FR-002, FR-003).
 */
export function PresentSplitSlider({ revenueCents }: PresentSplitSliderProps) {
  const router = useRouter();
  const { essentialPercentage: present, parts, setParts, splitSaveStatus, setSplitSaveStatus } =
    useAllocation();
  // Identifica o salvamento mais recente: respostas de salvamentos antigos são ignoradas
  const latestRequestId = useRef(0);

  async function save(split: PartPercentages) {
    const requestId = ++latestRequestId.current;
    setSplitSaveStatus("saving");
    const outcome = await runAction(
      () =>
        savePresentSplit({ educationPercentage: split.education, freePercentage: split.free }),
      { router },
    );
    if (requestId !== latestRequestId.current) return;
    setSplitSaveStatus(outcome.ok ? "saved" : "error");
  }

  const partCents = getPartCents(revenueCents, parts);
  const disabled = present <= 0;
  const [first, second] = thumbsFromSplit(parts);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold">
        {presentTotalLabel(present, calculatePlannedCents(revenueCents, present))}
      </p>
      <ul className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        {PRESENT_PARTS.map((part) => (
          <li key={part} data-testid={`split-${part}`} className="flex min-w-0 flex-col">
            <span className="flex items-center gap-2 font-semibold">
              <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", PART_DOT_CLASSES[part])} />
              {PART_LABELS[part]} {parts[part]}%
            </span>
            <span className="pl-4.5 tabular-nums text-muted-foreground">{formatBrl(partCents[part])}</span>
          </li>
        ))}
      </ul>
      <div className="relative">
        {/* Faixas coloridas sob o trilho: a largura de cada uma é um dado (porcentagem) */}
        <div aria-hidden="true" className="absolute inset-x-0 top-1/2 flex h-2 -translate-y-1/2 overflow-hidden rounded-full">
          {present > 0 &&
            PRESENT_PARTS.map((part) => (
              <div
                key={part}
                className={PART_DOT_CLASSES[part]}
                style={{ width: `${(parts[part] / present) * 100}%` }}
              />
            ))}
        </div>
        <Slider
          min={0}
          max={Math.max(present, 1)}
          step={1}
          minStepsBetweenThumbs={0}
          value={disabled ? [0, 0] : [first, second]}
          disabled={disabled}
          className="[&_[data-slot=slider-range]]:bg-transparent [&_[data-slot=slider-track]]:bg-transparent"
          thumbLabels={[thumbLabel("essentials", "education"), thumbLabel("education", "free")]}
          thumbValueTexts={[
            partSplitValueText({ essentials: parts.essentials, education: parts.education }),
            partSplitValueText({ education: parts.education, free: parts.free }),
          ]}
          onValueChange={(values) => setParts(splitFromThumbs(values, present))}
          onValueCommit={(values) => void save(splitFromThumbs(values, present))}
        />
      </div>
      {disabled && <p className="text-sm text-muted-foreground">{PRESENT_ZERO_HINT}</p>}
      <div className="flex min-h-7 items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
        {splitSaveStatus === "saving" && <span>Salvando…</span>}
        {splitSaveStatus === "saved" && <span>Salvo</span>}
        {splitSaveStatus === "error" && (
          <>
            <span className="text-destructive">Divisão não salva</span>
            <Button variant="outline" size="xs" onClick={() => void save(parts)}>
              Tentar novamente
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
