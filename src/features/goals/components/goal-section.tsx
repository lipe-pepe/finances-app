import { PlannedAmount } from "@/features/allocation/components/planned-amount";
import { GoalForm } from "@/features/goals/components/goal-form";
import { GoalList } from "@/features/goals/components/goal-list";
import { OverBudgetAlert } from "@/features/planning/components/over-budget-alert";
import { SectionTotal } from "@/features/planning/components/section-total";
import type { CategoryOption, GoalItem } from "@/features/planning/queries";
import { SECTION_LABELS, SECTION_TOTAL_LABELS } from "@/lib/planning-labels";

type GoalSectionProps = {
  goals: GoalItem[];
  categories: CategoryOption[];
  goalsTotalCents: number;
  revenueCents: number;
};

/** Seção do Momento Futuro: planejado, alerta, formulário em linha, lista e soma das metas. */
export function GoalSection({ goals, categories, goalsTotalCents, revenueCents }: GoalSectionProps) {
  return (
    <section aria-labelledby="goals-title" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="goals-title" className="text-xl font-semibold">
          {SECTION_LABELS.goals}
        </h2>
        <PlannedAmount section="goals" revenueCents={revenueCents} />
      </div>
      <OverBudgetAlert section="goals" revenueCents={revenueCents} totalCents={goalsTotalCents} />
      <div className="rounded-2xl border bg-card p-4">
        <GoalForm mode="create" categories={categories} />
      </div>
      <GoalList goals={goals} categories={categories} />
      <SectionTotal label={SECTION_TOTAL_LABELS.goals} totalCents={goalsTotalCents} />
    </section>
  );
}
