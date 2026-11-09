import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlannedAmount } from "@/features/allocation/components/planned-amount";
import { GoalForm } from "@/features/goals/components/goal-form";
import { GoalList } from "@/features/goals/components/goal-list";
import { OverBudgetAlert } from "@/features/planning/components/over-budget-alert";
import { SectionTotal } from "@/features/planning/components/section-total";
import type { CategoryOption, GoalItem } from "@/features/planning/queries";

type GoalSectionProps = {
  goals: GoalItem[];
  categories: CategoryOption[];
  goalsTotalCents: number;
  revenueCents: number;
};

/** Seção de metas futuras: valor planejado, cadastro, lista e soma das metas. */
export function GoalSection({ goals, categories, goalsTotalCents, revenueCents }: GoalSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Metas futuras</CardTitle>
        <CardDescription>
          <PlannedAmount section="goals" revenueCents={revenueCents} />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <OverBudgetAlert section="goals" revenueCents={revenueCents} totalCents={goalsTotalCents} />
        <GoalForm mode="create" categories={categories} />
        <GoalList goals={goals} categories={categories} />
        <SectionTotal label="Total de metas" totalCents={goalsTotalCents} />
      </CardContent>
    </Card>
  );
}
