import { CategoryIcon } from "@/components/category-icon";
import { deleteExpense } from "@/features/expenses/actions";
import { ExpenseForm } from "@/features/expenses/components/expense-form";
import { DeleteConfirmDialog } from "@/features/planning/components/delete-confirm-dialog";
import { PartBadge } from "@/features/planning/components/part-badge";
import type { CategoryOption, ExpenseItem } from "@/features/planning/queries";
import { formatBrl } from "@/lib/money";

type ExpenseListProps = {
  expenses: ExpenseItem[];
  categories: CategoryOption[];
  /** Mensagem da lista vazia (ex.: da parte selecionada; feature 007, FR-015) */
  emptyMessage?: string;
};

/** Lista de gastos do Momento Presente (renderizada no servidor), com editar e apagar por item. */
export function ExpenseList({
  expenses,
  categories,
  emptyMessage = "Nenhum gasto cadastrado.",
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y border-b">
      {expenses.map((expense) => (
        <li key={expense.id} className="flex flex-wrap items-center gap-x-3.5 gap-y-2 py-3">
          <CategoryIcon categoryName={expense.categoryName} />
          <div className="flex min-w-0 flex-1 basis-40 flex-col">
            <span className="truncate font-semibold">{expense.name}</span>
            <span className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
              <span>{expense.categoryName}</span>
              <span aria-hidden="true">·</span>
              <PartBadge part={expense.part} />
            </span>
          </div>
          <span className="font-semibold tabular-nums">{formatBrl(expense.amountCents)}</span>
          <div className="flex flex-wrap items-center justify-end gap-1 has-[form]:w-full">
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
