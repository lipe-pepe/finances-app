import { Wallet } from "lucide-react";
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
    <ul className="divide-y border-b">
      {incomes.map((income) => (
        <li key={income.id} className="flex flex-wrap items-center gap-x-3.5 gap-y-2 py-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink"
          >
            <Wallet className="size-5" />
          </span>
          <span className="min-w-0 flex-1 basis-40 truncate font-semibold">{income.name}</span>
          <span className="font-semibold tabular-nums">{formatBrl(income.amountCents)}</span>
          <div className="flex flex-wrap items-center justify-end gap-1 has-[form]:w-full">
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
