import { deleteIncome } from "@/features/incomes/actions";
import { IncomeForm } from "@/features/incomes/components/income-form";
import { DeleteConfirmDialog } from "@/features/planning/components/delete-confirm-dialog";
import type { IncomeItem } from "@/features/planning/queries";
import { formatBrl } from "@/lib/money";

/** Lista de ganhos (renderizada no servidor), com ações de editar e apagar por item. */
export function IncomeList({ incomes }: { incomes: IncomeItem[] }) {
  if (incomes.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum ganho cadastrado.</p>;
  }

  return (
    <ul className="divide-y">
      {incomes.map((income) => (
        <li key={income.id} className="flex flex-wrap items-center gap-2 py-2">
          <span className="min-w-0 flex-1 truncate">{income.name}</span>
          <span className="tabular-nums">{formatBrl(income.amountCents)}</span>
          <div className="flex w-full flex-wrap items-center justify-end gap-1 sm:w-auto">
            <IncomeForm mode="edit" income={income} />
            <DeleteConfirmDialog
              itemName={income.name}
              action={deleteIncome.bind(null, income.id)}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
