import { CategoryIcon } from "@/components/category-icon";
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
    <ul className="divide-y border-b">
      {actualExpenses.map((item) => (
        <li key={item.id} className="flex flex-wrap items-center gap-x-3.5 gap-y-2 py-3">
          <CategoryIcon categoryName={item.categoryName} />
          <div className="flex min-w-0 flex-1 basis-40 flex-col">
            <span className="truncate font-semibold">{item.name}</span>
            <span className="text-sm text-muted-foreground">
              <time dateTime={item.spentOn}>{formatDateBr(item.spentOn)}</time>
              {showCategory && (
                <>
                  {" · "}
                  <span>{item.categoryName}</span>
                </>
              )}
            </span>
          </div>
          <span className="font-semibold tabular-nums">{formatBrl(item.amountCents)}</span>
          <div className="flex flex-wrap items-center justify-end gap-1 has-[form]:w-full">
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
