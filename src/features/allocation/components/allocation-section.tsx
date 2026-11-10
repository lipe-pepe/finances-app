import { AllocationSlider } from "@/features/allocation/components/allocation-slider";
import { PlannedAmount } from "@/features/allocation/components/planned-amount";

/** Divisão da receita entre o Momento Presente e o Momento Futuro (primeiro bloco da Receita). */
export function AllocationSection({ revenueCents }: { revenueCents: number }) {
  return (
    <section aria-labelledby="allocation-title" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="allocation-title" className="text-xl font-semibold">
          Divisão da receita
        </h2>
        <p className="text-sm text-muted-foreground">
          Arraste para definir quanto da receita vai para o Momento Presente e para o Momento
          Futuro. A divisão é salva automaticamente.
        </p>
      </div>
      <AllocationSlider />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border bg-card px-4 py-3">
          <PlannedAmount section="expenses" revenueCents={revenueCents} showSectionLabel />
        </div>
        <div className="rounded-xl border bg-card px-4 py-3">
          <PlannedAmount section="goals" revenueCents={revenueCents} showSectionLabel />
        </div>
      </div>
    </section>
  );
}
