import { AllocationProvider } from "@/features/allocation/components/allocation-provider";
import { AllocationSection } from "@/features/allocation/components/allocation-section";
import { ExpenseSection } from "@/features/expenses/components/expense-section";
import { GoalSection } from "@/features/goals/components/goal-section";
import { IncomeSection } from "@/features/incomes/components/income-section";
import { AppHeader } from "@/features/planning/components/app-header";
import { PlanningTabs } from "@/features/planning/components/planning-tabs";
import { getPlanningData } from "@/features/planning/queries";
import { requireUserId } from "@/lib/auth";
import { PLANNING_TAB_PARAM, parsePlanningTab } from "@/lib/planning-tab";

type PlanningPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Tela única de planejamento (FR-007a), renderizada no servidor a cada requisição.
// A aba inicial vem do endereço (?tab=); as seções são Server Components passados ao
// PlanningTabs (cliente), que só controla qual delas aparece.
export default async function PlanningPage({ searchParams }: PlanningPageProps) {
  const userId = await requireUserId();
  const [data, params] = await Promise.all([getPlanningData(userId), searchParams]);
  const initialTab = parsePlanningTab(params[PLANNING_TAB_PARAM]);

  return (
    <>
      <AppHeader />
      <AllocationProvider initialEssentialPercentage={data.essentialPercentage}>
        <main className="mx-auto w-full max-w-4xl px-4 py-6">
          <PlanningTabs
            initialTab={initialTab}
            revenueCents={data.revenueCents}
            expensesTotalCents={data.expensesTotalCents}
            goalsTotalCents={data.goalsTotalCents}
            income={
              <>
                <IncomeSection incomes={data.incomes} revenueCents={data.revenueCents} />
                <AllocationSection revenueCents={data.revenueCents} />
              </>
            }
            present={
              <ExpenseSection
                expenses={data.expenses}
                categories={data.categories}
                expensesTotalCents={data.expensesTotalCents}
                revenueCents={data.revenueCents}
              />
            }
            future={
              <GoalSection
                goals={data.goals}
                categories={data.categories}
                goalsTotalCents={data.goalsTotalCents}
                revenueCents={data.revenueCents}
              />
            }
          />
        </main>
      </AllocationProvider>
    </>
  );
}
