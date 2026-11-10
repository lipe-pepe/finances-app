import { CategoryIcon } from "@/components/category-icon";
import { deleteGoal } from "@/features/goals/actions";
import { GoalForm } from "@/features/goals/components/goal-form";
import { DeleteConfirmDialog } from "@/features/planning/components/delete-confirm-dialog";
import type { CategoryOption, GoalItem } from "@/features/planning/queries";
import { formatBrl } from "@/lib/money";

type GoalListProps = {
  goals: GoalItem[];
  categories: CategoryOption[];
};

/** Lista de metas do Momento Futuro (renderizada no servidor), com editar e apagar por item. */
export function GoalList({ goals, categories }: GoalListProps) {
  if (goals.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma meta cadastrada.</p>;
  }

  return (
    <ul className="divide-y border-b">
      {goals.map((goal) => (
        <li key={goal.id} className="flex flex-wrap items-center gap-x-3.5 gap-y-2 py-3">
          <CategoryIcon categoryName={goal.categoryName} />
          <div className="flex min-w-0 flex-1 basis-40 flex-col">
            <span className="truncate font-semibold">{goal.name}</span>
            <span className="text-sm text-muted-foreground">
              {goal.categoryName ?? "Sem categoria"}
            </span>
          </div>
          <span className="font-semibold tabular-nums">{formatBrl(goal.amountCents)}</span>
          <div className="flex flex-wrap items-center justify-end gap-1 has-[form]:w-full">
            <GoalForm mode="edit" goal={goal} categories={categories} />
            <DeleteConfirmDialog itemName={goal.name} action={deleteGoal.bind(null, goal.id)} />
          </div>
        </li>
      ))}
    </ul>
  );
}
