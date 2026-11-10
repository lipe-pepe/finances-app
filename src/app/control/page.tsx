import { ActualExpenseForm } from "@/features/control/components/actual-expense-form";
import { ControlDashboard } from "@/features/control/components/control-dashboard";
import { getControlData } from "@/features/control/queries";
import { AppHeader } from "@/features/planning/components/app-header";
import { requireUserId } from "@/lib/auth";
import { getToday } from "@/lib/calendar";
import { REGISTER_SHEET_TITLE } from "@/lib/control-labels";

// Página Controle: gastos realizados do mês atual, renderizada no servidor a cada requisição.
// Desktop: dashboard à esquerda e formulário de registro num card à direita (FR-012).
export default async function ControlPage() {
  const userId = await requireUserId();
  const today = getToday(new Date());
  const data = await getControlData(userId, today);

  return (
    <>
      <AppHeader current="control" />
      <main className="mx-auto flex w-full max-w-6xl flex-wrap items-start gap-10 px-4 py-8 tablet:px-6 tablet:py-10">
        <div className="min-w-0 flex-[999_1_560px]">
          <ControlDashboard
            today={data.today}
            categories={data.categories}
            plannedCentsByCategory={data.plannedCentsByCategory}
            actualExpenses={data.actualExpenses}
          />
        </div>
        <aside
          aria-labelledby="register-expense-title"
          className="hidden min-w-0 flex-[1_1_300px] flex-col gap-4 rounded-xl border bg-card p-5 tablet:flex"
        >
          <h2 id="register-expense-title" className="font-semibold">
            {REGISTER_SHEET_TITLE}
          </h2>
          <ActualExpenseForm mode="create" categories={data.categories} />
        </aside>
      </main>
    </>
  );
}
