import { AllocationSlider } from "@/features/allocation/components/allocation-slider";

/**
 * Divisão da receita entre o Momento Presente e o Momento Futuro (primeiro bloco da Receita). Os
 * valores ficam abaixo dos rótulos do próprio slider (feature 007).
 */
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
      <AllocationSlider revenueCents={revenueCents} />
    </section>
  );
}
