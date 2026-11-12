import { PlannedAmount } from "@/features/allocation/components/planned-amount";
import { PresentSplitSlider } from "@/features/allocation/components/present-split-slider";
import { ExpenseForm } from "@/features/expenses/components/expense-form";
import { PartBudgetList } from "@/features/expenses/components/part-budget-list";
import { ExpenseList } from "@/features/expenses/components/expense-list";
import { OverBudgetAlert } from "@/features/planning/components/over-budget-alert";
import { SectionTotal } from "@/features/planning/components/section-total";
import type { CategoryOption, ExpenseItem } from "@/features/planning/queries";
import type { PartCents } from "@/lib/present-parts";
import { SECTION_LABELS, SECTION_TOTAL_LABELS } from "@/lib/planning-labels";

type ExpenseSectionProps = {
  expenses: ExpenseItem[];
  categories: CategoryOption[];
  expensesTotalCents: number;
  expensesTotalCentsByPart: PartCents;
  revenueCents: number;
};

/**
 * Seção do Momento Presente: planejado, divisão em partes (feature 006), alerta, formulário em
 * linha, lista e soma dos gastos.
 */
export function ExpenseSection({
  expenses,
  categories,
  expensesTotalCents,
  expensesTotalCentsByPart,
  revenueCents,
}: ExpenseSectionProps) {
  return (
    <section aria-labelledby="expenses-title" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="expenses-title" className="text-xl font-semibold">
          {SECTION_LABELS.expenses}
        </h2>
        <PlannedAmount section="expenses" revenueCents={revenueCents} />
      </div>
      <div className="rounded-2xl border bg-card p-4">
        <PresentSplitSlider revenueCents={revenueCents} />
      </div>
      <PartBudgetList revenueCents={revenueCents} plannedCentsByPart={expensesTotalCentsByPart} />
      <OverBudgetAlert section="expenses" revenueCents={revenueCents} totalCents={expensesTotalCents} />
      <div className="rounded-2xl border bg-card p-4">
        <ExpenseForm mode="create" categories={categories} />
      </div>
      <ExpenseList expenses={expenses} categories={categories} />
      <SectionTotal label={SECTION_TOTAL_LABELS.expenses} totalCents={expensesTotalCents} />
    </section>
  );
}
