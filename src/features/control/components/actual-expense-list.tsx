import { deleteActualExpense } from "@/features/control/actions";
import { ActualExpenseForm } from "@/features/control/components/actual-expense-form";
import type { ActualExpenseItem } from "@/features/control/queries";
import { DeleteConfirmDialog } from "@/features/planning/components/delete-confirm-dialog";
import type { CategoryOption } from "@/features/planning/queries";
import { formatDateBr } from "@/lib/calendar";
import { EMPTY_ACTUAL_EXPENSES } from "@/lib/control-labels";
import { formatBrl } from "@/lib/money";

type ActualExpenseListProps = {
  actualExpenses: ActualExpenseItem[];
  categories: CategoryOption[];
  /** Mostra a categoria de cada gasto (seleção "Todos" do dashboard) */
  showCategory: boolean;
};

/** Lista de gastos realizados do mês, com editar e apagar por item (FR-012, FR-016). */
export function ActualExpenseList({
  actualExpenses,
  categories,
  showCategory,
}: ActualExpenseListProps) {
  if (actualExpenses.length === 0) {
    return <p className="text-sm text-muted-foreground">{EMPTY_ACTUAL_EXPENSES}</p>;
  }

  return (
    <ul className="divide-y">
      {actualExpenses.map((item) => (
        <li key={item.id} className="flex flex-wrap items-center gap-2 py-2">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate">{item.name}</span>
            <span className="text-xs text-muted-foreground">
              <time dateTime={item.spentOn}>{formatDateBr(item.spentOn)}</time>
              {showCategory && (
                <>
                  {" · "}
                  <span>{item.categoryName}</span>
                </>
              )}
            </span>
          </div>
          <span className="tabular-nums">{formatBrl(item.amountCents)}</span>
          <div className="flex w-full flex-wrap items-center justify-end gap-1 sm:w-auto">
            <ActualExpenseForm mode="edit" actualExpense={item} categories={categories} />
            <DeleteConfirmDialog
              itemName={item.name}
              action={deleteActualExpense.bind(null, item.id)}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
