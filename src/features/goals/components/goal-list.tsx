import { deleteGoal } from "@/features/goals/actions";
import { GoalForm } from "@/features/goals/components/goal-form";
import { DeleteConfirmDialog } from "@/features/planning/components/delete-confirm-dialog";
import type { CategoryOption, GoalItem } from "@/features/planning/queries";
import { formatBrl } from "@/lib/money";

type GoalListProps = {
  goals: GoalItem[];
  categories: CategoryOption[];
};

/** Lista de metas futuras (renderizada no servidor), com editar e apagar por item. */
export function GoalList({ goals, categories }: GoalListProps) {
  if (goals.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma meta cadastrada.</p>;
  }

  return (
    <ul className="divide-y">
      {goals.map((goal) => (
        <li key={goal.id} className="flex flex-wrap items-center gap-2 py-2">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate">{goal.name}</span>
            <span className="text-xs text-muted-foreground">
              {goal.categoryName ?? "Sem categoria"}
            </span>
          </div>
          <span className="tabular-nums">{formatBrl(goal.amountCents)}</span>
          <div className="flex w-full flex-wrap items-center justify-end gap-1 sm:w-auto">
            <GoalForm mode="edit" goal={goal} categories={categories} />
            <DeleteConfirmDialog itemName={goal.name} action={deleteGoal.bind(null, goal.id)} />
          </div>
        </li>
      ))}
    </ul>
  );
}
