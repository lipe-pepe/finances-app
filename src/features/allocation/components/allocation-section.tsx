import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AllocationSlider } from "@/features/allocation/components/allocation-slider";
import { PlannedAmount } from "@/features/allocation/components/planned-amount";

/** Seção do slider de divisão da receita entre gastos essenciais e metas futuras. */
export function AllocationSection({ revenueCents }: { revenueCents: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Divisão da receita</CardTitle>
        <CardDescription>
          Arraste para definir quanto da receita vai para gastos essenciais e para metas futuras.
          A divisão é salva automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <AllocationSlider />
        <div className="grid gap-1 sm:grid-cols-2">
          <PlannedAmount section="expenses" revenueCents={revenueCents} />
          <PlannedAmount section="goals" revenueCents={revenueCents} />
        </div>
      </CardContent>
    </Card>
  );
}
