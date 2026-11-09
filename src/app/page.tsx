import { AllocationProvider } from "@/features/allocation/components/allocation-provider";
import { AllocationSection } from "@/features/allocation/components/allocation-section";
import { ExpenseSection } from "@/features/expenses/components/expense-section";
import { GoalSection } from "@/features/goals/components/goal-section";
import { IncomeSection } from "@/features/incomes/components/income-section";
import { AppHeader } from "@/features/planning/components/app-header";
import { getPlanningData } from "@/features/planning/queries";
import { requireUserId } from "@/lib/auth";

// Tela única de planejamento (FR-007a), renderizada no servidor a cada requisição.
// O AllocationProvider (cliente) só guarda a porcentagem do slider; as seções continuam sendo
// Server Components passados como children.
export default async function PlanningPage() {
  const userId = await requireUserId();
  const data = await getPlanningData(userId);

  return (
    <>
      <AppHeader />
      <AllocationProvider initialEssentialPercentage={data.essentialPercentage}>
        <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-2">
          <IncomeSection incomes={data.incomes} revenueCents={data.revenueCents} />
          <AllocationSection revenueCents={data.revenueCents} />
          <ExpenseSection
            expenses={data.expenses}
            categories={data.categories}
            expensesTotalCents={data.expensesTotalCents}
            revenueCents={data.revenueCents}
          />
          <GoalSection
            goals={data.goals}
            categories={data.categories}
            goalsTotalCents={data.goalsTotalCents}
            revenueCents={data.revenueCents}
          />
        </main>
      </AllocationProvider>
    </>
  );
}
