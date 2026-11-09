import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlannedAmount } from "@/features/allocation/components/planned-amount";
import { ExpenseForm } from "@/features/expenses/components/expense-form";
import { ExpenseList } from "@/features/expenses/components/expense-list";
import { OverBudgetAlert } from "@/features/planning/components/over-budget-alert";
import { SectionTotal } from "@/features/planning/components/section-total";
import type { CategoryOption, ExpenseItem } from "@/features/planning/queries";

type ExpenseSectionProps = {
  expenses: ExpenseItem[];
  categories: CategoryOption[];
  expensesTotalCents: number;
  revenueCents: number;
};

/** Seção de gastos essenciais: valor planejado, cadastro, lista e soma dos gastos. */
export function ExpenseSection({
  expenses,
  categories,
  expensesTotalCents,
  revenueCents,
}: ExpenseSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos essenciais</CardTitle>
        <CardDescription>
          <PlannedAmount section="expenses" revenueCents={revenueCents} />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <OverBudgetAlert section="expenses" revenueCents={revenueCents} totalCents={expensesTotalCents} />
        <ExpenseForm mode="create" categories={categories} />
        <ExpenseList expenses={expenses} categories={categories} />
        <SectionTotal label="Total de gastos" totalCents={expensesTotalCents} />
      </CardContent>
    </Card>
  );
}
