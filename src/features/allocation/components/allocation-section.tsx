import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AllocationSlider } from "@/features/allocation/components/allocation-slider";
import { PlannedAmount } from "@/features/allocation/components/planned-amount";

/** Seção do slider de divisão da receita entre o Momento Presente e o Momento Futuro. */
export function AllocationSection({ revenueCents }: { revenueCents: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Divisão da receita</CardTitle>
        <CardDescription>
          Arraste para definir quanto da receita vai para o Momento Presente e para o Momento
          Futuro. A divisão é salva automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <AllocationSlider />
        <div className="grid gap-1 sm:grid-cols-2">
          <PlannedAmount section="expenses" revenueCents={revenueCents} showSectionLabel />
          <PlannedAmount section="goals" revenueCents={revenueCents} showSectionLabel />
        </div>
      </CardContent>
    </Card>
  );
}
