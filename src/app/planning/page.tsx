import { AllocationProvider } from "@/features/allocation/components/allocation-provider";
import { AllocationSection } from "@/features/allocation/components/allocation-section";
import { ExpenseSection } from "@/features/expenses/components/expense-section";
import { GoalSection } from "@/features/goals/components/goal-section";
import { IncomeSection } from "@/features/incomes/components/income-section";
import { AppHeader } from "@/features/planning/components/app-header";
import { PlanningTabs } from "@/features/planning/components/planning-tabs";
import { getPlanningData } from "@/features/planning/queries";
import { requireUserId } from "@/lib/auth";
import { PLANNING_SUBTITLE } from "@/lib/planning-labels";
import { PLANNING_TAB_PARAM, parsePlanningTab } from "@/lib/planning-tab";

type PlanningPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Página Planejamento, renderizada no servidor a cada requisição. Na aba Receita, a divisão da
// receita vem antes dos ganhos (feature 004).
// A aba inicial vem do endereço (?tab=); as seções são Server Components passados ao
// PlanningTabs (cliente), que só controla qual delas aparece.
export default async function PlanningPage({ searchParams }: PlanningPageProps) {
  const userId = await requireUserId();
  const [data, params] = await Promise.all([getPlanningData(userId), searchParams]);
  const initialTab = parsePlanningTab(params[PLANNING_TAB_PARAM]);

  return (
    <>
      <AppHeader current="planning" />
      <AllocationProvider
        initialEssentialPercentage={data.essentialPercentage}
        initialEducationPercentage={data.educationPercentage}
        initialFreePercentage={data.freePercentage}
      >
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 tablet:px-6 tablet:py-10">
          <div className="flex flex-col gap-1">
            <h2 className="text-4xl font-bold tracking-tight">Planejamento</h2>
            <p className="text-muted-foreground">{PLANNING_SUBTITLE}</p>
          </div>
          <PlanningTabs
            initialTab={initialTab}
            revenueCents={data.revenueCents}
            incomeCount={data.incomes.length}
            expensesTotalCents={data.expensesTotalCents}
            goalsTotalCents={data.goalsTotalCents}
            income={
              <>
                <AllocationSection revenueCents={data.revenueCents} />
                <IncomeSection incomes={data.incomes} revenueCents={data.revenueCents} />
              </>
            }
            present={
              <ExpenseSection
                expenses={data.expenses}
                categories={data.categories}
                expensesTotalCents={data.expensesTotalCents}
                expensesTotalCentsByPart={data.expensesTotalCentsByPart}
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
