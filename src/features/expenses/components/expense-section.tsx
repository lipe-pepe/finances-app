import type { ReactNode } from "react";
import { PlannedAmount } from "@/features/allocation/components/planned-amount";
import { PresentSplitSlider } from "@/features/allocation/components/present-split-slider";
import { ExpenseList } from "@/features/expenses/components/expense-list";
import { PresentPartPanel } from "@/features/expenses/components/present-part-panel";
import { OverBudgetAlert } from "@/features/planning/components/over-budget-alert";
import { SectionTotal } from "@/features/planning/components/section-total";
import type { CategoryOption, ExpenseItem } from "@/features/planning/queries";
import { partEmptyMessage, partTotalLabel } from "@/lib/part-labels";
import { SECTION_LABELS } from "@/lib/planning-labels";
import { PRESENT_PARTS, type PartCents, type PresentPart } from "@/lib/present-parts";

type ExpenseSectionProps = {
  expenses: ExpenseItem[];
  categories: CategoryOption[];
  expensesTotalCents: number;
  expensesTotalCentsByPart: PartCents;
  revenueCents: number;
};

/**
 * Seção do Momento Presente: planejado, divisão em partes (feature 006), alerta do Momento Presente
 * inteiro e o painel de uma parte por vez (feature 007). A lista e o total de cada parte são
 * renderizados aqui, no servidor; o painel (cliente) só escolhe qual parte mostrar.
 */
export function ExpenseSection({
  expenses,
  categories,
  expensesTotalCents,
  expensesTotalCentsByPart,
  revenueCents,
}: ExpenseSectionProps) {
  const panels = Object.fromEntries(
    PRESENT_PARTS.map((part) => [
      part,
      <div key={part} className="flex flex-col gap-4">
        <ExpenseList
          expenses={expenses.filter((expense) => expense.part === part)}
          categories={categories}
          emptyMessage={partEmptyMessage(part)}
        />
        <SectionTotal label={partTotalLabel(part)} totalCents={expensesTotalCentsByPart[part]} />
      </div>,
    ]),
  ) as Record<PresentPart, ReactNode>;

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
      <OverBudgetAlert section="expenses" revenueCents={revenueCents} totalCents={expensesTotalCents} />
      <PresentPartPanel
        panels={panels}
        categories={categories}
        revenueCents={revenueCents}
        plannedCentsByPart={expensesTotalCentsByPart}
      />
    </section>
  );
}
