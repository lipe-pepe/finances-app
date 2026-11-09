import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IncomeForm } from "@/features/incomes/components/income-form";
import { IncomeList } from "@/features/incomes/components/income-list";
import { SectionTotal } from "@/features/planning/components/section-total";
import type { IncomeItem } from "@/features/planning/queries";

type IncomeSectionProps = {
  incomes: IncomeItem[];
  revenueCents: number;
};

/** Seção de ganhos: cadastro, lista e receita total (soma de todos os ganhos). */
export function IncomeSection({ incomes, revenueCents }: IncomeSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ganhos</CardTitle>
        <CardDescription>Cadastre suas fontes de renda. A soma é a sua receita total.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <IncomeForm mode="create" />
        <IncomeList incomes={incomes} />
        <SectionTotal label="Receita total" totalCents={revenueCents} />
      </CardContent>
    </Card>
  );
}
