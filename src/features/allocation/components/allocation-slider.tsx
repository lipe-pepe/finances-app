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
import { getGoalsPercentage } from "@/lib/planning";
import { SECTION_LABELS } from "@/lib/planning-labels";

export function AllocationSlider() {
  const router = useRouter();
  const { essentialPercentage, setEssentialPercentage, saveStatus, setSaveStatus } = useAllocation();
  // Identifica o salvamento mais recente: respostas de salvamentos antigos são ignoradas
  const latestRequestId = useRef(0);

  async function save(value: number) {
    const requestId = ++latestRequestId.current;
    setSaveStatus("saving");
    const outcome = await runAction(() => saveAllocation({ essentialPercentage: value }), {
      router,
    });
    if (requestId !== latestRequestId.current) return;
    setSaveStatus(outcome.ok ? "saved" : "error");
  }

  const goalsPercentage = getGoalsPercentage(essentialPercentage);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4 text-sm font-medium">
        <span>
          {SECTION_LABELS.expenses} {essentialPercentage}%
        </span>
        <span>
          {SECTION_LABELS.goals} {goalsPercentage}%
        </span>
      </div>
      <Slider
        min={0}
        max={100}
        step={1}
        value={[essentialPercentage]}
        aria-label={`Divisão entre ${SECTION_LABELS.expenses} e ${SECTION_LABELS.goals}`}
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
