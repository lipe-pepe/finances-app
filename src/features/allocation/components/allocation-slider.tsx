"use client";
// Client Component: o slider é arrastável e atualiza a tela em tempo real; o salvamento
// automático ao soltar também depende de eventos do navegador.

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { saveAllocation } from "@/features/allocation/actions";
import { useAllocation } from "@/features/allocation/components/allocation-provider";
import { runAction } from "@/lib/handle-action-result";
import { formatBrl } from "@/lib/money";
import { calculatePlannedCents, getGoalsPercentage } from "@/lib/planning";
import { SECTION_LABELS } from "@/lib/planning-labels";

type AllocationSliderProps = {
  revenueCents: number;
};

/**
 * Divisão da receita (feature 007): um único slider com o trilho laranja (Momento Presente) até a
 * divisão e azul (Momento Futuro) depois dela, e o valor em reais abaixo do rótulo de cada lado.
 */
export function AllocationSlider({ revenueCents }: AllocationSliderProps) {
  const router = useRouter();
  const { essentialPercentage, setEssentialPercentage, saveStatus, setSaveStatus, setParts } =
    useAllocation();
  // Identifica o salvamento mais recente: respostas de salvamentos antigos são ignoradas
  const latestRequestId = useRef(0);

  async function save(value: number) {
    const requestId = ++latestRequestId.current;
    setSaveStatus("saving");
    let savedParts: Parameters<typeof setParts>[0] | null = null;
    const outcome = await runAction(() => saveAllocation({ essentialPercentage: value }), {
      router,
      onSuccess: (data) => {
        savedParts = data.parts;
      },
    });
    if (requestId !== latestRequestId.current) return;
    // Alinha as partes com o reajuste gravado pelo servidor (feature 006, FR-008)
    if (savedParts) setParts(savedParts);
    setSaveStatus(outcome.ok ? "saved" : "error");
  }

  const goalsPercentage = getGoalsPercentage(essentialPercentage);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4 text-sm">
        <div className="flex min-w-0 flex-col">
          <span className="flex items-center gap-2 font-semibold">
            <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-present" />
            {SECTION_LABELS.expenses} {essentialPercentage}%
          </span>
          <span data-testid="slider-value-expenses" className="pl-4.5 tabular-nums text-muted-foreground">
            {formatBrl(calculatePlannedCents(revenueCents, essentialPercentage))}
          </span>
        </div>
        <div className="flex min-w-0 flex-col items-end text-right">
          <span className="flex items-center gap-2 font-semibold">
            <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-future" />
            {SECTION_LABELS.goals} {goalsPercentage}%
          </span>
          <span data-testid="slider-value-goals" className="tabular-nums text-muted-foreground">
            {formatBrl(calculatePlannedCents(revenueCents, goalsPercentage))}
          </span>
        </div>
      </div>
      <Slider
        min={0}
        max={100}
        step={1}
        value={[essentialPercentage]}
        aria-label={`Divisão entre ${SECTION_LABELS.expenses} e ${SECTION_LABELS.goals}`}
        className="[&_[data-slot=slider-range]]:bg-present [&_[data-slot=slider-track]]:bg-future"
        onValueChange={([value]) => setEssentialPercentage(value)}
        onValueCommit={([value]) => void save(value)}
      />
      <div className="flex min-h-7 items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
        {saveStatus === "saving" && <span>Salvando…</span>}
        {saveStatus === "saved" && <span>Salvo</span>}
        {saveStatus === "error" && (
          <>
            <span className="text-destructive">Divisão não salva</span>
            <Button variant="outline" size="xs" onClick={() => void save(essentialPercentage)}>
              Tentar novamente
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
