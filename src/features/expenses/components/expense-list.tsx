import { deleteExpense } from "@/features/expenses/actions";
import { ExpenseForm } from "@/features/expenses/components/expense-form";
import { DeleteConfirmDialog } from "@/features/planning/components/delete-confirm-dialog";
import type { CategoryOption, ExpenseItem } from "@/features/planning/queries";
import { formatBrl } from "@/lib/money";

type ExpenseListProps = {
  expenses: ExpenseItem[];
  categories: CategoryOption[];
};

/** Lista de gastos do Momento Presente (renderizada no servidor), com editar e apagar por item. */
export function ExpenseList({ expenses, categories }: ExpenseListProps) {
  if (expenses.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum gasto cadastrado.</p>;
  }

  return (
    <ul className="divide-y">
      {expenses.map((expense) => (
        <li key={expense.id} className="flex flex-wrap items-center gap-2 py-2">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate">{expense.name}</span>
            <span className="text-xs text-muted-foreground">{expense.categoryName}</span>
          </div>
          <span className="tabular-nums">{formatBrl(expense.amountCents)}</span>
          <div className="flex w-full flex-wrap items-center justify-end gap-1 sm:w-auto">
            <ExpenseForm mode="edit" expense={expense} categories={categories} />
            <DeleteConfirmDialog
              itemName={expense.name}
              action={deleteExpense.bind(null, expense.id)}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
